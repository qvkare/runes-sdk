import { Transaction } from './transaction.types';

export interface ValidationConfig {
  addressRegex: RegExp;
  minConfirmations: number;
  maxTransactionSize: number;
  minFee: string;
  maxFee: string;
  maxTransactionAmount: string;
}

export interface ValidationError {
  code: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
}

export interface AddressValidation {
  isValid: boolean;
  network: string;
  type: string;
}

export interface TransactionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fee: string;
  size: number;
  confirmations: number;
}

export interface SignatureValidation {
  isValid: boolean;
  publicKey: string;
  errors: string[];
}

export interface ValidationService {
  validateTransaction(transaction: Transaction): Promise<ValidationResult>;
}
