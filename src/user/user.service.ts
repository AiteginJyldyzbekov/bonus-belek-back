
import { Injectable, HttpException, HttpStatus, ConflictException, InternalServerErrorException, Logger } from "@nestjs/common";
import { AdminRegDto, CreateUserDto, Roles } from "src/auth/dto/auth.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(private prisma: PrismaService) { }

    async phoneNumber(phoneNumber: string) {
        return this.prisma.user.findUnique({
            where: { phoneNumber },
        });
    }

    async create(data: CreateUserDto) {
        try {
            this.logger.log(`Creating user with data: ${JSON.stringify(data, null, 2)}`);

            const result = await this.prisma.user.create({
                data: {
                    phoneNumber: data.phoneNumber,
                    password: data.password || null, // Пароль может быть null для клиентов
                    name: data.name,
                    role: data.role,
                },
            });

            this.logger.log(`User created successfully with ID: ${result.id}`);
            return result;

        } catch (error) {
            this.logger.error(`Failed to create user: ${error.message}`, error.stack);

            if (error.code === 'P2002') { // Prisma unique constraint error
                this.logger.warn(`Unique constraint violation for phone number: ${data.phoneNumber}`);
                throw new ConflictException('User with this phone number already exists');
            }

            // Логируем детали ошибки для диагностики
            if (error.code) {
                this.logger.error(`Database error code: ${error.code}`);
            }
            if (error.meta) {
                this.logger.error(`Database error meta: ${JSON.stringify(error.meta)}`);
            }

            throw new InternalServerErrorException(`Failed to create user: ${error.message}`);
        }
    }

    async findByPhoneNumber(phoneNumber: string) {
        return this.prisma.user.findUnique({
            where: { phoneNumber }
        });
    }

    async update(id: number, data: { name?: string; password?: string; role?: 'CLIENT' | 'ADMIN'; phoneNumber?: string }) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async createOrFindByPhone(phoneNumber: string, name: string, role: Roles) {
        let user = await this.phoneNumber(phoneNumber);

        if (!user) {
            user = await this.create({
                phoneNumber,
                name,
                role,
                password: role === Roles.ADMIN ? "" : null // Только для админов нужен пароль
            });
        }

        return user;
    }

    async findByPhoneOrName(phoneNumber: string, name: string) {
        // Ищем пользователя по номеру телефона
        let user = await this.phoneNumber(phoneNumber);

        // Если не найден по номеру, ищем по имени (независимо от регистра)
        if (!user && name) {
            user = await this.prisma.user.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: 'insensitive' // Поиск без учета регистра
                    }
                }
            });
        }

        return user;
    }

    async createOrFindByPhoneOrName(phoneNumber: string, name: string, role: Roles) {
        // Сначала пытаемся найти существующего пользователя по номеру телефона
        let user = await this.phoneNumber(phoneNumber);

        // Если пользователь найден по номеру телефона, проверяем имя
        if (user) {
            // Если у пользователя уже есть имя и оно не совпадает (независимо от регистра), это ошибка
            if (user.name && user.name.toLowerCase() !== name.toLowerCase()) {
                throw new HttpException(
                    `У пользовтеля с этим номером ${phoneNumber} другое имя.`,
                    HttpStatus.CONFLICT
                );
            }
            // Если у пользователя нет имени, устанавливаем его
            if (!user.name) {
                user = await this.update(user.id, {
                    name: name
                });
            }
            return user;
        }

        // Если пользователь не найден по номеру, ищем по имени
        if (name) {
            const userByName = await this.prisma.user.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: 'insensitive' // Поиск без учета регистра
                    }
                }
            });

            if (userByName) {
                // Если найден пользователь с таким именем, но другим номером телефона
                throw new HttpException(
                    `User with name '${name}' already exists with different phone number: ${userByName.phoneNumber}`,
                    HttpStatus.CONFLICT
                );
            }
        }

        // Если пользователь не найден ни по номеру, ни по имени, создаем нового
        user = await this.create({
            phoneNumber,
            name,
            role,
            password: role === Roles.ADMIN ? "" : null // Только для админов нужен пароль
        });

        return user;
    }

    async getBalance(phoneNumber: string) {
        const user = await this.phoneNumber(phoneNumber);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return {
            phoneNumber: user.phoneNumber,
            balance: user.balance,
            name: user.name
        };
    }

    async getTransactions(phoneNumber: string) {
        const user = await this.phoneNumber(phoneNumber);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const transactions = await this.prisma.transaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                productId: true,
                productName: true,
                productPrice: true,
                cashbackAmount: true,
                balanceBefore: true,
                balanceAfter: true,
                createdAt: true
            }
        });

        return {
            phoneNumber: user.phoneNumber,
            name: user.name,
            transactions
        };
    }

    async getUserProfile(phoneNumber: string) {
        const user = await this.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Получаем все транзакции пользователя
        const transactions = await this.prisma.transaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                productId: true,
                productName: true,
                productPrice: true,
                cashbackAmount: true,
                balanceBefore: true,
                balanceAfter: true,
                createdAt: true,
                paymentType: true
            }
        });

        // Подсчитываем статистику
        const totalTransactions = transactions.length;
        const totalCashbackEarned = transactions.reduce((sum, transaction) => sum + transaction.cashbackAmount, 0);
        const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.productPrice, 0);

        // Получаем последнюю транзакцию
        const lastTransaction = transactions.length > 0 ? transactions[0] : null;

        // Получаем топ товары (по количеству покупок)
        const productStats = transactions.reduce((acc, transaction) => {
            const productName = transaction.productName;
            if (!acc[productName]) {
                acc[productName] = {
                    name: productName,
                    count: 0,
                    totalSpent: 0,
                    totalCashback: 0
                };
            }
            acc[productName].count++;
            acc[productName].totalSpent += transaction.productPrice;
            acc[productName].totalCashback += transaction.cashbackAmount;
            return acc;
        }, {} as Record<string, any>);

        const topProducts = Object.values(productStats)
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 5);

        return {
            statusCode: 200,
            message: 'User profile retrieved successfully',
            data: {
                user: {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    name: user.name,
                    role: user.role,
                    balance: user.balance,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
                statistics: {
                    totalTransactions,
                    totalCashbackEarned: Math.round(totalCashbackEarned * 10) / 10, // Округляем до 1 знака
                    totalSpent: Math.round(totalSpent * 10) / 10,
                    averageCashbackPerTransaction: totalTransactions > 0 ? Math.round((totalCashbackEarned / totalTransactions) * 10) / 10 : 0,
                    lastTransactionDate: lastTransaction?.createdAt || null
                },
                recentTransactions: transactions.slice(0, 10), // Последние 10 транзакций
                topProducts,
                allTransactions: transactions
            }
        };
    }

    async addCashback(phoneNumber: string, cashbackAmount: number, productData: {
        productId: string;
        productName: string;
        productPrice: number;
        paymentType?: string; // Делаем опциональным для обратной совместимости
    }) {
        return await this.prisma.$transaction(async (prisma) => {
            // Получаем пользователя с блокировкой для обновления
            const user = await prisma.user.findUnique({
                where: { phoneNumber },
                select: { id: true, balance: true }
            });

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            const balanceBefore = user.balance;
            const balanceAfter = balanceBefore + cashbackAmount;

            // Обновляем баланс пользователя
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: { balance: balanceAfter }
            });

            // Создаем запись о транзакции
            const transaction = await prisma.transaction.create({
                data: {
                    userId: user.id,
                    productId: productData.productId,
                    productName: productData.productName,
                    productPrice: productData.productPrice,
                    paymentType: productData.paymentType, // Добавляем paymentType
                    cashbackAmount,
                    balanceBefore,
                    balanceAfter
                }
            });

            return {
                user: {
                    id: updatedUser.id,
                    phoneNumber: updatedUser.phoneNumber,
                    name: updatedUser.name,
                    balance: updatedUser.balance
                },
                transaction: {
                    id: transaction.id,
                    cashbackAmount: transaction.cashbackAmount,
                    balanceBefore: transaction.balanceBefore,
                    balanceAfter: transaction.balanceAfter,
                    paymentType: transaction.paymentType, // Добавляем в ответ
                    createdAt: transaction.createdAt
                }
            };
        });
    }

    async deductCashback(phoneNumber: string, deductionAmount: number, reason: string = 'Manual deduction') {
        return await this.prisma.$transaction(async (prisma) => {
            // Получаем пользователя с блокировкой для обновления
            const user = await prisma.user.findUnique({
                where: { phoneNumber },
                select: { id: true, balance: true, name: true, phoneNumber: true }
            });

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            const balanceBefore = user.balance;
            const balanceAfter = balanceBefore - deductionAmount;

            // Проверяем, что баланс не станет отрицательным
            if (balanceAfter < 0) {
                throw new HttpException(`Insufficient balance. Current balance: ${balanceBefore}, requested deduction: ${deductionAmount}`, HttpStatus.BAD_REQUEST);
            }

            // Обновляем баланс пользователя
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: { balance: balanceAfter }
            });

            // Создаем запись о транзакции списания (с отрицательной суммой)
            const transaction = await prisma.transaction.create({
                data: {
                    userId: user.id,
                    productId: 'DEDUCTION', // Специальный ID для операций списания
                    productName: reason, // Причина списания
                    productPrice: 0, // Для списания цена товара не применима
                    cashbackAmount: -deductionAmount, // Отрицательная сумма для списания
                    balanceBefore,
                    balanceAfter
                }
            });

            this.logger.log(`Deducted ${deductionAmount} from user ${phoneNumber}. Balance: ${balanceBefore} -> ${balanceAfter}`);

            return {
                user: {
                    id: updatedUser.id,
                    phoneNumber: updatedUser.phoneNumber,
                    name: updatedUser.name,
                    balance: updatedUser.balance
                },
                transaction: {
                    id: transaction.id,
                    cashbackAmount: transaction.cashbackAmount,
                    balanceBefore: transaction.balanceBefore,
                    balanceAfter: transaction.balanceAfter,
                    createdAt: transaction.createdAt
                }
            };
        });
    }

    async setUserRole(phoneNumber: string, role: 'CLIENT' | 'ADMIN') {
        const user = await this.phoneNumber(phoneNumber);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return await this.update(user.id, { role });
    }
}