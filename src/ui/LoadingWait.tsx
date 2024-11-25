import * as React from "react";
import MaterialSpinner from "./MaterialSpinner";

export default function LoadingWait() {
  return (
    <div className="loading_wait">
      <div className="loading_wait-spinner_group">
        <div className="loading_wait-spinner_wrap">
          <MaterialSpinner
            rotationDuration={500}
            radius={20}
            strokeWidth={2}
            staticPath
          />
        </div>
        <p>Starting Word Salad Sifter</p>
      </div>
    </div>
  );
}