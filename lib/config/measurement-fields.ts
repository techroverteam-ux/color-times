import type { MeasurementValues } from "@/models/shared/measurements";

export const MEASUREMENT_FIELD_DEFS: { key: keyof MeasurementValues; label: string }[] = [
  { key: "bust", label: "Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeveLength", label: "Sleeve Length (SL)" },
  { key: "blouseLength", label: "Blouse Length" },
  { key: "armhole", label: "Armhole (AH)" },
  { key: "neckFront", label: "Neck (Front)" },
  { key: "neckBack", label: "Neck (Back)" },
  { key: "upperChest", label: "Upper Chest (UC)" },
  { key: "lowerChest", label: "Lower Chest (LC)" },
];
