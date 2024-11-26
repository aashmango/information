declare module 'probe-image-size' {
  interface ProbeResult {
    width: number;
    height: number;
    type: string;
    mime: string;
    wUnits: string;
    hUnits: string;
    length: number;
    url: string;
  }

  function probe(url: string): Promise<ProbeResult>;

  export = probe;
} 