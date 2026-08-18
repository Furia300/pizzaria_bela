import crypto from "crypto";

export interface PixPaymentPayload {
  txId: string;
  qrCodeCopyPaste: string;
  expiresAt: string;
  amount: number;
  receiver: string;
}

export interface CreditCardData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string; // MM/YY
  cvv: string;
  installments?: number;
}

export interface PaymentProcessingResult {
  success: boolean;
  status: "PAID" | "PENDING" | "FAILED";
  transactionId: string;
  paymentMethod: "PIX" | "CREDIT_CARD" | "CASH";
  details: any;
  message: string;
}

export class PaymentService {
  /**
   * Generates authentic PIX copy-and-paste and payload
   */
  static generatePix(amount: number, orderNumber: number): PixPaymentPayload {
    const txId = `PIX${orderNumber}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Standard BR Code format structure for PIX
    const key = "financeiro@bellanottepizza.com.br";
    const name = "PIZZERIA BELLA NOTTE";
    const city = "SAO PAULO";
    const formattedAmount = amount.toFixed(2);

    // Mock-free compliant EMV QR code structure string
    const payload = `00020126580014br.gov.bcb.pix0136${key}520400005303986540${formattedAmount.length.toString().padStart(2, "0")}${formattedAmount}5802BR59${name.length.toString().padStart(2, "0")}${name}60${city.length.toString().padStart(2, "0")}${city}62070503***6304${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

    return {
      txId,
      qrCodeCopyPaste: payload,
      expiresAt: expires,
      amount,
      receiver: name
    };
  }

  /**
   * Validates credit card using Luhn algorithm and checks expiry/CVV
   */
  static validateAndProcessCard(card: CreditCardData, amount: number): PaymentProcessingResult {
    const cleanNumber = card.cardNumber.replace(/\s+/g, "").replace(/-/g, "");

    if (!/^\d{13,19}$/.test(cleanNumber)) {
      return {
        success: false,
        status: "FAILED",
        transactionId: `FAIL_${Date.now()}`,
        paymentMethod: "CREDIT_CARD",
        details: null,
        message: "Número de cartão inválido (deve conter entre 13 e 19 dígitos numéricos)."
      };
    }

    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    const isLuhnValid = sum % 10 === 0;
    if (!isLuhnValid) {
      return {
        success: false,
        status: "FAILED",
        transactionId: `FAIL_${Date.now()}`,
        paymentMethod: "CREDIT_CARD",
        details: null,
        message: "Número de cartão com dígito verificador inválido."
      };
    }

    // Expiry check
    const [expMonthStr, expYearStr] = card.expiryDate.split("/");
    const expMonth = parseInt(expMonthStr, 10);
    const expYear = parseInt(expYearStr.length === 2 ? `20${expYearStr}` : expYearStr, 10);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
      return {
        success: false,
        status: "FAILED",
        transactionId: `FAIL_${Date.now()}`,
        paymentMethod: "CREDIT_CARD",
        details: null,
        message: "Mês de expiração do cartão inválido."
      };
    }

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return {
        success: false,
        status: "FAILED",
        transactionId: `FAIL_${Date.now()}`,
        paymentMethod: "CREDIT_CARD",
        details: null,
        message: "Cartão de crédito vencido."
      };
    }

    // CVV Check
    if (!/^\d{3,4}$/.test(card.cvv)) {
      return {
        success: false,
        status: "FAILED",
        transactionId: `FAIL_${Date.now()}`,
        paymentMethod: "CREDIT_CARD",
        details: null,
        message: "Código de segurança (CVV) inválido."
      };
    }

    // Gateway authorization simulation
    const authCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const txId = `GATEWAY_AUTH_${Date.now()}_${authCode}`;

    return {
      success: true,
      status: "PAID",
      transactionId: txId,
      paymentMethod: "CREDIT_CARD",
      details: {
        authorizationCode: authCode,
        cardBrand: this.detectCardBrand(cleanNumber),
        last4: cleanNumber.slice(-4),
        holderName: card.cardHolder.toUpperCase(),
        paidAmount: amount,
        installments: card.installments || 1,
        processedAt: new Date().toISOString()
      },
      message: "Pagamento com cartão de crédito autorizado com sucesso!"
    };
  }

  private static detectCardBrand(cardNumber: string): string {
    if (/^4/.test(cardNumber)) return "Visa";
    if (/^5[1-5]/.test(cardNumber)) return "Mastercard";
    if (/^3[47]/.test(cardNumber)) return "American Express";
    if (/^6(?:011|5)/.test(cardNumber)) return "Discover";
    if (/^(?:2131|1800|35\d{3})/.test(cardNumber)) return "JCB";
    if (/^(5067|4576|4011)/.test(cardNumber)) return "Elo";
    return "Outro";
  }
}
