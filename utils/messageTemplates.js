function getServiceMenuButtons() {
    return [
      { type: "reply", reply: { id: "exterior", title: "Exterior Wash" } },
      { type: "reply", reply: { id: "interior", title: "Interior Wash" } },
      { type: "reply", reply: { id: "full", title: "Full Car Cleaning" } }
    ];
  }
  
  module.exports = { getServiceMenuButtons };
  