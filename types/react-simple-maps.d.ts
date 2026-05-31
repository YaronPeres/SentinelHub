// Type shim for react-simple-maps (no @types package available)
// Covers only the subset of the API used in GeoHeatmap.tsx
declare module "react-simple-maps" {
  import { ComponentType, ReactNode, SVGAttributes, MouseEvent } from "react";

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    style?: React.CSSProperties;
    children?: ReactNode;
  }
  export const ComposableMap: ComponentType<ComposableMapProps>;

  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Geography[] }) => ReactNode;
  }
  export interface Geography {
    rsmKey: string;
    [key: string]: unknown;
  }
  export const Geographies: ComponentType<GeographiesProps>;

  export interface GeographyProps extends SVGAttributes<SVGPathElement> {
    geography: Geography;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
  }
  export const Geography: ComponentType<GeographyProps>;

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
    onMouseEnter?: (event: MouseEvent<SVGGElement>) => void;
    onMouseLeave?: (event: MouseEvent<SVGGElement>) => void;
    onClick?: (event: MouseEvent<SVGGElement>) => void;
  }
  export const Marker: ComponentType<MarkerProps>;

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    children?: ReactNode;
  }
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
}
