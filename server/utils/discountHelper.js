export const getCustomerDiscount = (subscriptionStart) => {
    if (!subscriptionStart) return 0;
  
    const now = new Date();
    const start = new Date(subscriptionStart);
    const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  
    if (diffMonths >= 24) return 15;
    if (diffMonths >= 12) return 12;
    if (diffMonths >= 6) return 7;
    if (diffMonths >= 3) return 5;
    return 5;
  };
  