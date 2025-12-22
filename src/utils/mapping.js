export const mapMidtransToTransactionStatus = (midtransStatus) => {
  switch (midtransStatus) {
    case "pending":
      return "PENDING";

    case "capture":
    case "settlement":
      return "PENDING"

    case "deny":
    case "cancel":
    case "expire":
    case "refund":
      return "CANCELLED";

    default:
      return "PENDING";
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
