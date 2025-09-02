import { registerNode, registerAction } from "@/lib/plugins/api";
import { useEngineStore } from "@/store/engine";

registerNode({
    nodeId: "AC_SPRAY_VARIABLE_RATE",
    type: "action",
    title: "Variable Rate Spray",
    required: ["sprayer_nozzle", "scan_ndvi"],
    paramsSchema: {
        rate: { type: "number", description: "Liters per hectare" },
    },
});

registerAction("AC_SPRAY_VARIABLE_RATE", (context, action) => {
    console.log("[Plugin Action] Executing variable rate spray:", action.params);
    // Logic to consume chemicals would go here
    useEngineStore.getState().addEvent({
        type: "action_spray_variable",
        payload: { ...action.params },
    });
});
