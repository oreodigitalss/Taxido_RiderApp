import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';

/** Local vector artwork scales cleanly across phone sizes and works offline. */
export function RydapLandscape({ height = 180 }: { height?: number }) {
  return (
    <Svg width="100%" height={height} viewBox="0 0 400 240" preserveAspectRatio="xMidYMax slice">
      <Defs>
        <LinearGradient id="hill" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#5ACB9C" /><Stop offset="1" stopColor="#006249" /></LinearGradient>
        <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFFFFF" /><Stop offset="1" stopColor="#AADDD0" /></LinearGradient>
      </Defs>
      {[25, 52, 83, 119, 158, 288, 321, 352, 375].map((x, i) => <Rect key={x} x={x} y={65 + (i % 4) * 15} width={18 + i % 3 * 5} height={100} rx={2} fill="#80D4B4" opacity={0.22} />)}
      <Path d="M0 153 Q70 108 155 146 T400 113 V240 H0Z" fill="url(#hill)" />
      <Path d="M0 190 Q120 128 235 175 T400 148 V240 H0Z" fill="#007959" />
      <Path d="M110 240 Q210 204 173 172 Q142 151 230 143 Q181 156 213 174 Q275 209 234 240Z" fill="#064B3B" />
      <Path d="M179 240 Q246 207 194 175" stroke="#D4EADA" strokeWidth="3" strokeDasharray="15 13" fill="none" />
      <Circle cx="326" cy="113" r="13" fill="#00815C" /><Rect x="324" y="119" width="4" height="25" fill="#00634A" />
      <Circle cx="345" cy="102" r="17" fill="#169F70" /><Rect x="343" y="113" width="4" height="28" fill="#00634A" />
      <Path d="M125 154 L140 129 Q145 121 160 121 H210 Q222 122 237 143 L254 151 Q261 156 260 177 H121 Q118 160 125 154Z" fill="url(#body)" stroke="#004E3D" strokeWidth="2" />
      <Path d="M146 129 H174 V146 H136Z M181 129 H208 Q217 130 229 146 H181Z" fill="#104E44" />
      <Path d="M127 155 L145 158 L150 165 H125Z M239 154 L255 158 V165 H235Z" fill="#FFFFFF" />
      <Path d="M163 153 H220 M174 153 V174" stroke="#79BBA7" strokeWidth="1.5" />
      <Circle cx="145" cy="176" r="13" fill="#123C35" /><Circle cx="145" cy="176" r="6" fill="#C0D7D0" />
      <Circle cx="236" cy="176" r="13" fill="#123C35" /><Circle cx="236" cy="176" r="6" fill="#C0D7D0" />
    </Svg>
  );
}
