export function displayName(customer) {
  // No null guard. A customer without a company falls over here.
  return customer.company.trim() || customer.email;
}

export function isVatRegistered(customer) {
  return typeof customer.vatNumber === 'string' && customer.vatNumber.length > 0;
}
