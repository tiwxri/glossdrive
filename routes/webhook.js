app.post("/webhook", async (req, res) => {
    try {
      const body = req.body;
  
      // Validate incoming webhook structure
      if (
        body.object &&
        Array.isArray(body.entry) &&
        body.entry.length > 0 &&
        Array.isArray(body.entry[0].changes) &&
        body.entry[0].changes.length > 0
      ) {
        const value = body.entry[0].changes[0].value;
  
        if (!value.messages || value.messages.length === 0) {
          console.log("No messages in the payload.");
          return res.sendStatus(200);
        }
  
        // Loop through all messages (better than just messages[0])
        for (const message of value.messages) {
          const from = message.from;
          if (!from) {
            console.warn("Message received without sender info.");
            continue; // Skip this message
          }
  
          // Handle text and interactive messages
          let msgBody = "";
          if (message.type === "text") {
            msgBody = message.text?.body;
          } else if (message.type === "interactive") {
            msgBody =
              message.interactive?.button_reply?.title ||
              message.interactive?.list_reply?.title ||
              "";
          } else {
            console.log("Unsupported message type:", message.type);
            continue;
          }
  
          if (!msgBody) {
            console.log("Empty or unsupported message format.");
            continue;
          }
  
          const session = await getSession(from);
          const currentStep = session.step || "initial";
  
          if (currentStep === "initial") {
            await sendMessage(
              from,
              "Welcome to GlossDrive! 🚗✨\n\nPlease choose a service:\n*Basic*\n*Premium*"
            );
            await updateSession(from, { step: "service" });
          } else if (currentStep === "service") {
            const validServices = ["basic", "premium"];
            const service = msgBody.toLowerCase();
            if (!validServices.includes(service)) {
              await sendMessage(from, "Please choose either *Basic* or *Premium*.");
              continue;
            }
  
            await sendMessage(
              from,
              "Great choice! 🎉\nNow select any add-ons you'd like:\n*Waxing*, *Interior Vacuum*, *Tyre Polish*.\n(You can type multiple separated by commas, or say 'None')"
            );
            await updateSession(from, { step: "addons", service });
          } else if (currentStep === "addons") {
            await sendMessage(
              from,
              "Awesome! Lastly, please select a time slot:\n*10AM-12PM*, *12PM-2PM*, *2PM-4PM*"
            );
            await updateSession(from, { step: "timeslot", addons: msgBody });
          } else if (currentStep === "timeslot") {
            await sendMessage(
              from,
              "✅ All set! We'll see you at your selected time. To start over, type 'restart'."
            );
            await updateSession(from, { step: "completed", timeslot: msgBody });
          } else if (currentStep === "completed" && msgBody.toLowerCase() === "restart") {
            await sendMessage(from, "Let's start over! 👋");
            await updateSession(from, { step: "initial" });
          } else {
            await sendMessage(from, "Thanks! If you'd like to restart, type 'restart'.");
          }
        }
      }
  
      res.sendStatus(200); // Always respond quickly to WhatsApp
    } catch (error) {
      console.error("Webhook error:", error);
      res.sendStatus(500);
    }
  });
  