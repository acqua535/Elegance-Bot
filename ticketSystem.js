const fs = require("fs");

const file = "./ticketsData.json";

// =====================================
// LOAD & SAVE DATABASE
// =====================================
function loadData() {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "{}", "utf8");
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
        console.error("❌ Errore lettura ticketsData.json:", error);
        return {};
    }
}

function saveData(data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 4), "utf8");
}

// =====================================
// GESTIONE TICKET (Core)
// =====================================
function createTicket(userId, ticket) {
    const data = loadData();
    data[userId] = {
        userId,
        ...ticket,
        step: 0, // Per la logica IA
        staffPing: { used: false, time: null }, // Per il cooldown 24h
        createdAt: ticket.createdAt || Date.now()
    };
    saveData(data);
    return true;
}

function getTicket(userId) {
    const data = loadData();
    return data[userId] || null;
}

function getTicketByChannel(channelId) {
    const data = loadData();
    return Object.values(data).find(ticket => ticket.channelId === channelId) || null;
}

function updateTicket(userId, newData) {
    const data = loadData();
    if (!data[userId]) return false;
    data[userId] = { ...data[userId], ...newData };
    saveData(data);
    return true;
}

function deleteTicket(userId) {
    const data = loadData();
    if (!data[userId]) return false;
    delete data[userId];
    saveData(data);
    return true;
}

function hasOpenTicket(userId) {
    return Boolean(getTicket(userId));
}

// =====================================
// SISTEMA PING STAFF (Aggiornato)
// =====================================
function canPingStaff(userId) {
    const ticket = getTicket(userId);
    if (!ticket || !ticket.staffPing) return true;
    if (!ticket.staffPing.used) return true;
    
    const cooldown = 24 * 60 * 60 * 1000;
    return (Date.now() - ticket.staffPing.time) >= cooldown;
}

function useStaffPing(userId) {
    const ticket = getTicket(userId);
    if (!ticket) return false;
    ticket.staffPing = { used: true, time: Date.now() };
    return updateTicket(userId, ticket);
}

// =====================================
// ESPORTAZIONE
// =====================================
function getAllTickets() {
    const data = loadData();
    // Restituiamo un array, così nel ticket.js usiamo .find() facilmente
    return Object.values(data);
}

module.exports = {
    createTicket,
    getTicket,
    getTicketByChannel,
    updateTicket,
    deleteTicket,
    hasOpenTicket,
    canPingStaff,
    useStaffPing,
    getAllTickets
};
