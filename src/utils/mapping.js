export const mapMidtransToTransactionStatus = (midtransStatus) => {
  switch (midtransStatus) {
    case "pending":
      return "pending";

    case "capture":
    case "settlement":
      return "paid"

    case "deny":
    case "cancel":
    case "expire":
    case "refund":
      return "cancelled";

    default:
      return "pending";
  }
};

export const mapMidtransToPaymentStatus = (midtransStatus) => {
  switch (midtransStatus) {
    case "pending":
      return "pending";

    case "capture":
    case "settlement":
      return "completed";

    case "deny":
    case "cancel":
    case "expire":
    case "refund":
      return "failed";

    default:
      return "pending";
  }
};
