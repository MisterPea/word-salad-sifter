import * as React from "react";
import ProcessPanelOverlay from "./ui/IframeProcessPanelOverlay";
import { createRoot } from 'react-dom/client';

const htmlRoot = document.getElementById('word_salad_sifter-root');
if (!htmlRoot) throw new Error('Failed to find React root element');
const root = createRoot(htmlRoot);

root.render(<ProcessPanelOverlay />);