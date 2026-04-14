import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        }}
      >
        {/* Gift box body */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Lid */}
          <div
            style={{
              width: 18,
              height: 5,
              background: "#fff",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Ribbon knot on lid */}
            <div
              style={{
                width: 4,
                height: 5,
                background: "#f9a8d4",
                borderRadius: 1,
              }}
            />
          </div>
          {/* Box */}
          <div
            style={{
              width: 18,
              height: 11,
              background: "rgba(255,255,255,0.9)",
              borderRadius: "0 0 2px 2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Vertical ribbon stripe */}
            <div
              style={{
                width: 4,
                height: 11,
                background: "#f9a8d4",
                borderRadius: 1,
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
