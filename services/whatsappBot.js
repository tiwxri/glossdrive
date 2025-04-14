client.on('message', async (message) => {
  console.log(`📩 New message received: ${message.body} from ${message.from}`);
});
