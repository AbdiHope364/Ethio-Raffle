/**
 * ============================================================================
 * UNIFIED NOTIFICATION SERVICE (§29)
 * ============================================================================
 * Decouples SMS, Email, and Push notifications from core business logic.
 */

export interface NotificationPayload {
  recipientPhone?: string;
  recipientEmail?: string;
  recipientUserId?: string;
  title: string;
  titleAm?: string;
  message: string;
  messageAm?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Dispatches SMS via configured Telecom Gateway (e.g. Africa's Talking / Ethio Telecom SMS API).
   */
  static async sendSMS(phone: string, message: string): Promise<boolean> {
    if (!phone) return false;
    // In development / sandbox, log message to console
    console.log(`[SMS GATEWAY DISPATCH] -> To: ${phone} | Text: "${message}"`);
    return true;
  }

  /**
   * Dispatches transactional Email.
   */
  static async sendEmail(email: string, subject: string, body: string): Promise<boolean> {
    if (!email) return false;
    console.log(`[EMAIL GATEWAY DISPATCH] -> To: ${email} | Subject: "${subject}"`);
    return true;
  }

  // --------------------------------------------------------------------------
  // DOMAIN EVENT HANDLERS
  // --------------------------------------------------------------------------

  static async onPaymentConfirmed(prisma: any, order: { customerPhone: string; orderNumber: string; totalAmount: number; quantity: number; raffleTitle: string }): Promise<void> {
    const text = `LuckyEthio: Payment confirmed for Order #${order.orderNumber}. ${order.quantity} ticket(s) issued for "${order.raffleTitle}". Total: ${order.totalAmount} ETB. Good luck!`;
    await this.sendSMS(order.customerPhone, text);
  }

  static async onTicketPurchased(prisma: any, ticket: { customerPhone: string; ticketNumber: number; verificationCode: string; raffleTitle: string }): Promise<void> {
    const text = `LuckyEthio: Ticket #${ticket.ticketNumber} minted for "${ticket.raffleTitle}". Verification Code: ${ticket.verificationCode}. View: luckyethio.com/my-tickets`;
    await this.sendSMS(ticket.customerPhone, text);
  }

  static async onRaffleSoldOut(prisma: any, raffle: { title: string; totalTickets: number; drawDate: Date }): Promise<void> {
    console.log(`[EVENT] Raffle 100% Sold Out: "${raffle.title}". Scheduled for midnight draw on ${raffle.drawDate}.`);
  }

  static async onDrawStarting(prisma: any, raffle: { title: string; id: string }): Promise<void> {
    console.log(`[EVENT] Live Cryptographic Draw Room Opened for: "${raffle.title}"`);
  }

  static async onWinnerSelected(prisma: any, data: { winnerPhone: string; winnerName: string; prizeTitle: string; winningTicketNumber: number; claimUrl: string }): Promise<void> {
    const text = `🎉 CONGRATULATIONS ${data.winnerName}! Your ticket #${data.winningTicketNumber} won the "${data.prizeTitle}" in LuckyEthio! Claim your prize: ${data.claimUrl}`;
    await this.sendSMS(data.winnerPhone, text);
  }

  static async onClaimReminder(prisma: any, data: { winnerPhone: string; prizeTitle: string; deadlineDays: number }): Promise<void> {
    const text = `LuckyEthio Reminder: You have ${data.deadlineDays} days remaining to confirm your delivery and claim your prize "${data.prizeTitle}".`;
    await this.sendSMS(data.winnerPhone, text);
  }

  static async onPayoutCompleted(prisma: any, data: { sellerPhone: string; amount: number; txRef: string }): Promise<void> {
    const text = `LuckyEthio: Settlement payout of ${data.amount.toLocaleString()} ETB successfully transferred (Ref: ${data.txRef}).`;
    await this.sendSMS(data.sellerPhone, text);
  }
}

