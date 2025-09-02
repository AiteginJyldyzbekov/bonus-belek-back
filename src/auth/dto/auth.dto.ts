import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class InitiateLoginDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be in valid format (e.g., +1234567890 or 1234567890)'
    })
    phoneNumber: string;
}

export class VerifyOtpDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Phone number must be in valid format (e.g., +1234567890 or 1234567890)'
    })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
    @Matches(/^\d{6}$/, { message: 'OTP code must contain only digits' })
    otpCode: string;
}
