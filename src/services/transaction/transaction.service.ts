import { Transaction, TransactionValidationResult, BatchTransactionResult } from '../../types/transaction.types';
import { RpcClient } from '../../types/rpc.types';
import { Logger } from '../../types/logger.types';

export class TransactionService {
    constructor(
        private readonly rpcClient: RpcClient,
        private readonly logger: Logger
    ) {}

    async validateTransaction(txid: string): Promise<TransactionValidationResult> {
        try {
            const tx = await this.rpcClient.getTransaction(txid);
            const isValid = tx.confirmations ? tx.confirmations > 0 : false;
            return {
                isValid,
                errors: isValid ? [] : ['Transaction not confirmed']
            };
        } catch (error) {
            this.logger.error('Error validating transaction:', error as Error);
            return {
                isValid: false,
                errors: ['Failed to validate transaction']
            };
        }
    }

    async getTransaction(txid: string): Promise<Transaction | null> {
        try {
            return await this.rpcClient.getTransaction(txid);
        } catch (error) {
            this.logger.error('Error getting transaction:', error as Error);
            return null;
        }
    }

    async waitForConfirmation(txid: string, confirmations: number = 1): Promise<boolean> {
        try {
            const tx = await this.rpcClient.getTransaction(txid);
            return tx.confirmations ? tx.confirmations >= confirmations : false;
        } catch (error) {
            this.logger.error('Error waiting for confirmation:', error as Error);
            return false;
        }
    }

    async processTransaction(tx: Transaction): Promise<BatchTransactionResult> {
        try {
            const validation = await this.validateTransaction(tx.txid);
            if (!validation.isValid) {
                throw new Error(`Invalid transaction: ${validation.errors.join(', ')}`);
            }

            const result: BatchTransactionResult = {
                txid: tx.txid,
                success: true
            };

            this.logger.info('Transaction processed successfully:', tx.txid);
            return result;
        } catch (error) {
            this.logger.error('Error processing transaction:', error as Error);
            throw error;
        }
    }
}
