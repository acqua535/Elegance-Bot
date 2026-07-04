const STAFF_ROLES = [
  "1505192718068879430",
  "1505193231674249396",
  "1505193131790962698"
];

function isStaff(member) {
  if (!member || !member.roles) return false;
  return member.roles.cache.some(role =>
    STAFF_ROLES.includes(role.id)
  );
}

module.exports = {
  STAFF_ROLES,
  isStaff
};
