export { metadata, viewport } from "next-sanity/studio";

import StudioClient from "./studio-client";

export default function StudioPage() {
  return <StudioClient />;
}
