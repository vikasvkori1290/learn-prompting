const Battle = require('../models/Battle');

function setupBattleHandler(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join_room', async (roomId) => {
      socket.join(roomId);
      console.log(`👤 Socket ${socket.id} joined room ${roomId}`);

      const battle = await Battle.findById(roomId);
      if (battle) {
        io.to(roomId).emit('battle_update', battle);
      }
    });

    socket.on('submit_prompt', async ({ roomId, userId, prompt }) => {
      // Logic handled via REST API primarily, but we emit here to notify peers
      // Or we can perform the submit here too.
      // For consistency with the REST API approach, we just broadcast an update request
      const battle = await Battle.findById(roomId);
      if (battle) {
        io.to(roomId).emit('battle_update', battle);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupBattleHandler;
