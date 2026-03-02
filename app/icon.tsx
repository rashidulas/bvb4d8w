import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#18181b',
                    borderRadius: '6px',
                }}
            >
                {/* Dumbbell icon */}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Left weight plate */}
                    <rect x="2" y="8" width="3" height="8" rx="1" fill="#ef4444" />
                    {/* Left handle connector */}
                    <rect x="5" y="10" width="2" height="4" rx="0.5" fill="#71717a" />
                    {/* Center bar */}
                    <rect x="7" y="11" width="10" height="2" rx="1" fill="#a1a1aa" />
                    {/* Right handle connector */}
                    <rect x="17" y="10" width="2" height="4" rx="0.5" fill="#71717a" />
                    {/* Right weight plate */}
                    <rect x="19" y="8" width="3" height="8" rx="1" fill="#ef4444" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
