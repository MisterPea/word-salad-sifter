/* eslint-disable @typescript-eslint/no-explicit-any */
export function _createJobDescriptionTable(data: Record<string, string>): any {

  function calculatePageBreakIndex(rows: number, columns: number) {
    const totalCells = rows * columns;
    // console.log(">>>", Math.round(totalCells * 2.7) + 2);
    return Math.round(totalCells * 2.7) + 1;  // Adding 1 to place it after the table
  }

  const requests = [
    {
      // Create a 2x2 table at index 1 (beginning of the document)
      insertTable: {
        rows: Math.round(Object.keys(data).length / 2),
        columns: 2,
        location: {
          index: 1
        }
      }
    },
    {
      "insertPageBreak": {
        "location": {
          "index": calculatePageBreakIndex(Math.round(Object.keys(data).length / 2), 2)
        }
      }
    }
  ];
  return requests;
}

/**
 * Function to generate the request object to be sent to batchUpdate
 * @param {{string:string}} data Data object of the LLM output.
 * @param {number} insertionIndex Index of the start of the table
 * @returns 
 */
export function populateTable(data: Record<string, string>, insertionIndex: number): any {
  let index = insertionIndex;
  const requests = [];
  const dataKeys = Object.keys(data);

  for (let i = 0; i < dataKeys.length; i += 1) {
    const currKey = dataKeys[i];
    let currValue = data[currKey];
    const linkUrl = currValue;

    // Check for Job Link:
    if (currKey === "Job URL") {
      currValue = `${currValue.substring(0, 80)}...`;
    }

    const currText = `${currKey}:\n${currValue}`;
    const startBold = index;
    const endBold = startBold + currKey.length + 1;
    const endText = endBold + currValue.length;

    const requestObjectPart = {
      "insertText": {
        "text": currText,
        "location": {
          "index": index
        }
      },
    };

    const combinedStyle = {
      "updateTextStyle": {
        "range": {
          "startIndex": index,
          "endIndex": endText + 1
        },
        "textStyle": {
          "bold": false,
          "italic": false,
          "underline": false,
          "smallCaps": false,
          "link": null,
          "fontSize": {
            "magnitude": 9,
            "unit": "PT"
          },
          "weightedFontFamily": {
            "fontFamily": "Inter",
            "weight": 400
          },
          "foregroundColor": {
            "color": {
              "rgbColor": {
                "blue": 0.18,
                "green": 0.18,
                "red": 0.18
              }
            }
          }
        },
        "fields": "bold,italic,underline,smallCaps,fontSize,weightedFontFamily,foregroundColor,link"
      }
    };

    if (currKey === "Job URL") {
      combinedStyle.updateTextStyle.textStyle.link = { "url": linkUrl };
      combinedStyle.updateTextStyle.textStyle.underline = true;
    }

    const paragraphStyle = {
      "updateParagraphStyle": {
        "range": {
          "startIndex": endBold,
          "endIndex": endText
        },
        "paragraphStyle": {
          "lineSpacing": 115.0
        },
        "fields": "lineSpacing"
      }
    };

    const boldText = {
      "updateTextStyle": {
        "range": {
          "startIndex": startBold,
          "endIndex": endBold
        },
        "textStyle": {
          "underline": false,
          "weightedFontFamily": {
            "fontFamily": "Inter",
            "weight": 600
          }
        },
        "fields": "weightedFontFamily,underline"
      }
    };

    requests.push(requestObjectPart, combinedStyle, boldText, paragraphStyle);

    /* 
    Since we only have 2 columns we only have to worry about the skips from 
    column 1 -> 2 and 2 -> next line. 
    To go from column to column we need to advance the pointer by 2 (plus the inserted text length).
    To go to the next line we need to advance the pointer by 3 (plus the inserted text length).
    */
    index += currText.length;
    if (i % 2 === 0) {
      // left side
      index += 2;
    } else {
      // right side
      index += 3;
    }
  }
  return requests;
}

interface Document {
  body: {
    content: Array<{
      paragraph?: any;
      table?: {
        [x: string]: any;
        endIndex: number;
      };
    }>;
  };
}

export function findInsertionIndexAfterTable(doc: Document): number {

  let tableEndIndex = -1;

  // Iterate through the content array
  for (const element of doc.body.content) {
    if (element.table) {
      // If we find a table, update the tableEndIndex
      tableEndIndex = element.table.tableRows[0].startIndex + 2;
      // We've found the first table, so we can stop searching
      break;
    }
  }

  if (tableEndIndex === -1) {
    throw new Error("No table found in the document");
  }

  return tableEndIndex;
}
