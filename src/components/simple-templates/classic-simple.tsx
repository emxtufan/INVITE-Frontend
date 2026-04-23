import React from "react";
import { SimplePalette, SimpleTemplateRenderProps } from "./types";
import ClassicSimpleFullTemplate from "./classic-simple-full";

export const CLASSIC_SIMPLE_PALETTES: SimplePalette[] = [
  {
    id: "classic-default",
    name: "Classic Elegant",
    primary: "#d4af37",
    secondary: "#a88a2a",
    accent: "#efe3c0",
    surface: "#ffffff",
    text: "#2f2a1e",
  },
];

const ClassicSimpleTemplate: React.FC<SimpleTemplateRenderProps> = ({
  data,
  onOpenRSVP,
  editMode = false,
  onProfileUpdate,
}) => {
  return (
    <ClassicSimpleFullTemplate
      data={data}
      onOpenRSVP={onOpenRSVP}
      editMode={editMode}
      onProfileUpdate={onProfileUpdate}
    />
  );
};

export default ClassicSimpleTemplate;
