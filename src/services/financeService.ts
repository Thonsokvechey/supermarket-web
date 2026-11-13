import { apiClient } from './apiClient';
import type {
  BranchDto,
  BusinessSettingResponse,
  CurrencyDto,
  ExchangeRateDto,
  UpdateBusinessSettingRequest,
} from '../types';

export const financeService = {
  // Branches (/branches)
  async getAllBranches(): Promise<BranchDto[]> {
    const { data } = await apiClient.get<BranchDto[]>('/branches');
    return data;
  },

  async createBranch(payload: BranchDto): Promise<BranchDto> {
    const { data } = await apiClient.post<BranchDto>('/branches', payload);
    return data;
  },

  async updateBranch(id: string, payload: BranchDto): Promise<BranchDto> {
    const { data } = await apiClient.put<BranchDto>(`/branches/${id}`, payload);
    return data;
  },

  // Business Settings (/business-settings)
  async getAllBusinessSettings(): Promise<BusinessSettingResponse[]> {
    const { data } = await apiClient.get<BusinessSettingResponse[]>('/business-settings');
    return data;
  },

  async getSettingsByBranchId(branchId: string): Promise<BusinessSettingResponse> {
    const { data } = await apiClient.get<BusinessSettingResponse>(`/business-settings/branch/${branchId}`);
    return data;
  },

  async updateSettingsByBranchId(
    branchId: string,
    payload: UpdateBusinessSettingRequest
  ): Promise<BusinessSettingResponse> {
    const { data } = await apiClient.put<BusinessSettingResponse>(
      `/business-settings/branch/${branchId}`,
      payload
    );
    return data;
  },

  // Currencies (/currencies)
  async getAllCurrencies(): Promise<CurrencyDto[]> {
    const { data } = await apiClient.get<CurrencyDto[]>('/currencies');
    return data;
  },

  async saveCurrency(payload: CurrencyDto): Promise<CurrencyDto> {
    const { data } = await apiClient.post<CurrencyDto>('/currencies', payload);
    return data;
  },

  // Exchange Rates (/exchange-rates)
  async getAllExchangeRates(): Promise<ExchangeRateDto[]> {
    const { data } = await apiClient.get<ExchangeRateDto[]>('/exchange-rates');
    return data;
  },

  async createExchangeRate(payload: ExchangeRateDto): Promise<ExchangeRateDto> {
    const { data } = await apiClient.post<ExchangeRateDto>('/exchange-rates', payload);
    return data;
  },
};

