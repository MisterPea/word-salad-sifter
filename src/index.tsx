import * as React from "react";
import Popup from "./popup";
import { createRoot } from 'react-dom/client';

const htmlRoot = document.getElementById('__appRoot');
if (!htmlRoot) throw new Error('Failed to find React root element');
const root = createRoot(htmlRoot);

root.render(<Popup />);