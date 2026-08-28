import { prisma } from "@raffle/database";
import { executeAtomicTicketPurchase } from "./concurrency";

export interface USSDRequest {
  sessionId: string;
  phoneNumber: string;
  text: string;
}

export interface USSDResponse {
  message: string;
  continueSession: boolean;
}

/**
 * Handles USSD session logic conforming to Ethio Telecom / Safaricom USSD standards.
 */
export async function handleUSSD(req: USSDRequest): Promise<USSDResponse> {
  const { sessionId, phoneNumber, text } = req;
  const parts = text.split("*").filter(Boolean);

  let lang = "EN";
  const user = await prisma.user.findUnique({
    where: { phone: phoneNumber },
  });
  if (user?.preferredLang) {
    lang = user.preferredLang;
  }

  const agent = await prisma.agent.findFirst({
    where: { user: { phone: phoneNumber }, status: "ACTIVE" },
  });

  // Level 0: Main Menu
  if (parts.length === 0 || text === "") {
    if (lang === "AM") {
      let menu = "እንኳን ወደ ላኪ ኢትዮ ሎተሪ በደህና መጡ\n";
      menu += "1. ንቁ ዕጣዎችን እይና ግዛ\n";
      menu += "2. የቆረጥኳቸውን ቲኬቶች እይ\n";
      if (agent) {
        menu += "3. የወኪል ቲኬት መቁረጫ (POS)\n";
        menu += "4. የወኪል ሂሳብ ቀሪ (Float)\n";
      }
      menu += "5. ቋንቋ ቀይር / Change Language\n";
      menu += "6. ስለ ዕጣው ፍትሃዊነት (Provably Fair)";
      return { message: menu, continueSession: true };
    } else {
      let menu = "Welcome to LuckyEthio Raffle\n";
      menu += "1. View Active Raffles & Buy\n";
      menu += "2. Check My Active Tickets\n";
      if (agent) {
        menu += "3. Agent POS Ticket Sale\n";
        menu += "4. Check Agent Float Balance\n";
      }
      menu += "5. Change Language\n";
      menu += "6. Provably Fair Info";
      return { message: menu, continueSession: true };
    }
  }

  const choice = parts[0];

  // OPTION 1: View Active Raffles
  if (choice === "1") {
    const raffles = await prisma.raffle.findMany({
      where: { status: "ACTIVE" },
      take: 4,
      orderBy: { createdAt: "desc" },
    });

    if (parts.length === 1) {
      if (raffles.length === 0) {
        return {
          message: lang === "AM" ? "በአሁኑ ሰዓት ምንም ንቁ ዕጣ የለም።" : "No active raffles available.",
          continueSession: false,
        };
      }
      let msg = lang === "AM" ? "ዕጣ ይምረጡ:\n" : "Select a Raffle:\n";
      raffles.forEach((r, idx) => {
        const title = lang === "AM" && r.titleAm ? r.titleAm : r.title;
        msg += `${idx + 1}. ${title} (${r.ticketPrice} ETB)\n`;
      });
      return { message: msg, continueSession: true };
    }

    const raffleIndex = parseInt(parts[1], 10) - 1;
    const selectedRaffle = raffles[raffleIndex];

    if (!selectedRaffle) {
      return {
        message: lang === "AM" ? "የተሳሳተ ምርጫ። እባክዎ እንደገና ይሞክሩ።" : "Invalid selection. Please try again.",
        continueSession: false,
      };
    }

    if (parts.length === 2) {
      return {
        message:
          lang === "AM"
            ? `${selectedRaffle.titleAm || selectedRaffle.title}\nየአንድ ቲኬት ዋጋ: ${selectedRaffle.ticketPrice} ብር\nየሚገዙትን የቲኬት ብዛት ያስገቡ (1-10):`
            : `${selectedRaffle.title}\nPrice: ${selectedRaffle.ticketPrice} ETB\nEnter number of tickets to buy (1-10):`,
        continueSession: true,
      };
    }

    const ticketCount = parseInt(parts[2], 10);
    if (isNaN(ticketCount) || ticketCount < 1 || ticketCount > 10) {
      return {
        message: lang === "AM" ? "እባክዎ ትክክለኛ የቲኬት ቁጥር ያስገቡ (1-10)።" : "Invalid quantity. Enter between 1-10.",
        continueSession: false,
      };
    }

    const totalCost = selectedRaffle.ticketPrice * ticketCount;

    if (parts.length === 3) {
      return {
        message:
          lang === "AM"
            ? `ጠቅላላ ክፍያ: ${totalCost} ብር ለ ${ticketCount} ቲኬት።\nበቴሌብር (Telebirr) ለመክፈል 1 ይጫኑ\nለመሰረዝ 2 ይጫኑ:`
            : `Total Cost: ${totalCost} ETB for ${ticketCount} ticket(s).\nPress 1 to Pay with Telebirr\nPress 2 to Cancel:`,
        continueSession: true,
      };
    }

    if (parts[3] === "1") {
      const purchaseResult = await executeAtomicTicketPurchase({
        raffleId: selectedRaffle.id,
        userId: user?.id,
        customerPhone: phoneNumber,
        ticketCount,
        paymentMethod: "TELEBIRR",
        purchaseMethod: "USSD",
      });

      if (purchaseResult.success && purchaseResult.tickets) {
        const ticketNums = purchaseResult.tickets.map((t) => `#${t.ticketNumber}`).join(", ");
        return {
          message:
            lang === "AM"
              ? `ክፍያዎ ተሳክቷል! የቲኬት ቁጥሮችዎ: ${ticketNums}። የኤስኤምኤስ ማረጋገጫ ተልኮልዎታል። መልካም እድል!`
              : `Payment Successful! Your ticket(s): ${ticketNums}. SMS confirmation sent to ${phoneNumber}. Good luck!`,
          continueSession: false,
        };
      } else {
        return {
          message: lang === "AM" ? `ስህተት: ${purchaseResult.message}` : `Failed: ${purchaseResult.message}`,
          continueSession: false,
        };
      }
    } else {
      return {
        message: lang === "AM" ? "ግብይቱ ተሰርዟል።" : "Transaction cancelled.",
        continueSession: false,
      };
    }
  }

  // OPTION 2: Check My Active Tickets
  if (choice === "2") {
    const tickets = await prisma.ticket.findMany({
      where: { customerPhone: phoneNumber },
      include: { raffle: true },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    if (tickets.length === 0) {
      return {
        message:
          lang === "AM"
            ? "በዚህ ስልክ ቁጥር የተቆረጠ ምንም ቲኬት የለም።"
            : `No tickets found for ${phoneNumber}.`,
        continueSession: false,
      };
    }

    let msg = lang === "AM" ? "የቅርብ ጊዜ ቲኬቶችዎ:\n" : "Your Recent Tickets:\n";
    tickets.forEach((t) => {
      msg += `• #${t.ticketNumber} - ${t.raffle.title.substring(0, 20)} (${t.verificationCode})\n`;
    });
    return { message: msg, continueSession: false };
  }

  // OPTION 3: Agent POS Ticket Sale
  if (choice === "3") {
    if (!agent) {
      return {
        message: "Unauthorized: This phone number is not an active agent.",
        continueSession: false,
      };
    }

    const raffles = await prisma.raffle.findMany({
      where: { status: "ACTIVE" },
      take: 4,
    });

    if (parts.length === 1) {
      let msg = "AGENT POS - Select Raffle:\n";
      raffles.forEach((r, idx) => {
        msg += `${idx + 1}. ${r.title} (${r.ticketPrice} ETB)\n`;
      });
      return { message: msg, continueSession: true };
    }

    const selectedRaffle = raffles[parseInt(parts[1], 10) - 1];
    if (!selectedRaffle) {
      return { message: "Invalid raffle.", continueSession: false };
    }

    if (parts.length === 2) {
      return {
        message: `Agent POS: ${selectedRaffle.title}\nEnter Customer Phone Number (e.g. 0911223344):`,
        continueSession: true,
      };
    }

    const custPhone = parts[2].trim();

    if (parts.length === 3) {
      return {
        message: `Customer: ${custPhone}\nEnter Number of Tickets to Sell:`,
        continueSession: true,
      };
    }

    const count = parseInt(parts[3], 10);
    const cost = selectedRaffle.ticketPrice * count;

    if (parts.length === 4) {
      return {
        message: `Confirm Sale:\nTotal Cash: ${cost} ETB\nCustomer: ${custPhone}\nFloat Balance: ${agent.floatBalance} ETB\nPress 1 to Deduct Float & Mint Tickets\nPress 2 to Cancel:`,
        continueSession: true,
      };
    }

    if (parts[4] === "1") {
      const saleResult = await executeAtomicTicketPurchase({
        raffleId: selectedRaffle.id,
        customerPhone: custPhone,
        ticketCount: count,
        paymentMethod: "AGENT_CASH",
        soldByAgentId: agent.id,
        purchaseMethod: "USSD",
      });

      if (saleResult.success && saleResult.tickets) {
        const ticketNums = saleResult.tickets.map((t) => `#${t.ticketNumber}`).join(", ");
        return {
          message: `Agent Sale Complete! Minted: ${ticketNums}. SMS sent to customer ${custPhone}. Float deducted: ${cost} ETB.`,
          continueSession: false,
        };
      } else {
        return { message: `Sale Failed: ${saleResult.message}`, continueSession: false };
      }
    } else {
      return { message: "Agent sale cancelled.", continueSession: false };
    }
  }

  // OPTION 4: Agent Float Balance
  if (choice === "4") {
    if (!agent) {
      return { message: "Not an agent account.", continueSession: false };
    }
    return {
      message: `Agent ID: ${agent.id.substring(0, 8)}\nName: ${agent.fullName}\nFloat Balance: ${agent.floatBalance.toLocaleString()} ETB\nCommission Rate: ${agent.commissionRate}%\nDaily Limit: ${agent.dailySalesLimit.toLocaleString()} ETB`,
      continueSession: false,
    };
  }

  // OPTION 5: Change Language
  if (choice === "5") {
    if (parts.length === 1) {
      return {
        message: "Choose Language / ቋንቋ ይምረጡ:\n1. English\n2. አማርኛ (Amharic)",
        continueSession: true,
      };
    }
    const newLang = parts[1] === "2" ? "AM" : "EN";
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { preferredLang: newLang },
      });
    }
    return {
      message: newLang === "AM" ? "ቋንቋዎ በተሳካ ሁኔታ ወደ አማርኛ ተቀይሯል።" : "Language set to English successfully.",
      continueSession: false,
    };
  }

  // OPTION 6: Provably Fair Info
  if (choice === "6") {
    return {
      message:
        "LuckyEthio uses SHA-256 Commit-Reveal RNG. All draw hashes are published pre-draw and independently auditable. Fully licensed by NLA.",
      continueSession: false,
    };
  }

  return {
    message: "Invalid choice. Please redial *804#.",
    continueSession: false,
  };
}

