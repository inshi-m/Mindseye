import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

const CytoscapeChart = ({ elements, answer }) => {
  const cyRef = useRef(null);

  // Function to format the answer for display without numbering or "Flowchart:"
  const filterAndFormatAnswer = (answer) => {
    // Remove unwanted parts like "Flowchart:", numbering (1., 2., etc.), and extra spaces
    let filteredAnswer = answer
      .replace(/\*\*Flowchart:\*\*/g, "") // Remove "Flowchart:" part
      .replace(/\*\*Start\*\*/g, "") // Remove "Start"
      .replace(/\*\*End\*\*/g, "") // Remove "End"
      .replace(/^\d+\.\s*/gm, "") // Remove numbering like "1.", "2.", etc.
      .trim();

    // Split the answer into sections based on double asterisks (headings)
    const sections = filteredAnswer
      .split(/\*\*(.*?)\*\*/).filter(section => section.trim() !== "");

    // Return the formatted answer with headings and content properly displayed
    return (
      <div>
        {sections.map((section, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <strong>{section.trim()}</strong>
          </div>
        ))}
      </div>
    );
  };

  // Function to generate nodes and edges for Cytoscape flowchart
  const generateFlowchartNodes = (answer) => {
    const nodes = [];
    const edges = [];

    // Remove "Flowchart:" part and numbering for flowchart generation
    const cleanAnswer = answer
      .replace(/\*\*Flowchart:\*\*/g, "") // Remove "Flowchart:" part
      .replace(/^\d+\.\s*/gm, "") // Remove numbering like "1.", "2.", etc.
      .trim();

    // Split the answer into sections using double asterisks **Heading**
    const sections = cleanAnswer.split(/\*\*(.*?)\*\*/).filter(section => section.trim() !== "");

    // Iterate through sections and combine the heading with content to create nodes
    sections.forEach((section, index) => {
      // Split the section content and group it with the heading
      const parts = section.split("\n").filter(part => part.trim() !== "");
      const heading = parts[0]; // First part is the heading
      const content = parts.slice(1).join(" "); // Join the rest of the content into one string

      // Combine the heading and content in a single node
      const combinedText = heading.trim() + " " + content.trim();

      const nodeId = `A${index}`;
      nodes.push({
        data: { id: nodeId, label: combinedText },
      });

      // Add an edge between the previous section and the current one
      if (index > 0) {
        edges.push({
          data: { source: `A${index - 1}`, target: nodeId },
        });
      }
    });

    return { nodes, edges };
  };

  useEffect(() => {
    console.log("Answer passed to CytoscapeChart:", answer);

    if (!answer) {
      console.error("No answer data available for rendering.");
      return;
    }

    // Generate flowchart nodes and edges
    const { nodes, edges } = generateFlowchartNodes(answer);

    // Initialize Cytoscape instance
    const cy = cytoscape({
      container: cyRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: "node",
          style: {
            shape: "rectangle",
            "background-color": "#0077b6",
            label: "data(label)", // Use the label provided in the data
            color: "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "14px",
            "font-weight": "bold",
            "text-outline-width": 2,
            "text-outline-color": "#0077b6",
            width: "400px", // Fixed width to ensure text wraps
            height: "label", // Auto height to adjust based on content
            padding: "8px",
            "border-width": 2,
            "border-color": "#023e8a",
            "border-style": "solid",
            "text-wrap": "wrap", // Enables text wrapping
            "text-max-width": "350px", // Limits the max width for wrapping
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#48cae4",
            "target-arrow-color": "#48cae4",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
      layout: {
        name: "breadthfirst",
        directed: true,
        padding: 10,
        fit: true,
        spacingFactor: 0.2, // Smaller spacing factor to pack nodes closer
        nodeDimensionsIncludeLabels: true,
      },
      zoomingEnabled: true,
      userZoomingEnabled: true,
      minZoom: 0.5,
      maxZoom: 1.5,
      panningEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      autoungrabify: true,
      autounselectify: true,
    });

    cy.fit(); // Ensure the chart fits in the viewport

    // Cleanup when component unmounts
    return () => {
      cy.destroy();
    };
  }, [answer]);

  return (
    <div style={{ textAlign: "left" }}>
      {answer && (
        <div
          style={{
            marginBottom: "20px",
            marginTop: "20px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#fff",
            textAlign: "left",
            marginLeft: "80px",
            maxWidth: "90%",
            wordWrap: "break-word",
          }}
        >
          Answer:
          {filterAndFormatAnswer(answer)}
        </div>
      )}

      {/* Cytoscape flowchart */}
      <div
        ref={cyRef}
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "1000px",
          overflow: "auto",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          margin: "0 auto",
          border: "2px solid #ccc",
          borderRadius: "20px",
          borderColor: "#fff",
        }}
      />
    </div>
  );
};

export default CytoscapeChart;
