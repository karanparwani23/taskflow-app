/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View } from 'react-native';

export type AppIconName =
  | 'search'
  | 'filter'
  | 'calendar'
  | 'plus'
  | 'close'
  | 'edit'
  | 'delete'
  | 'clock'
  | 'arrowLeft'
  | 'arrowRight'
  | 'check';

interface Props {
  name: AppIconName;
  size?: number;
  color?: string;
}

/** Simple, consistent line icons drawn with native views, without an icon font. */
export function AppIcon({ name, size = 18, color = '#F2F6FC' }: Props) {
  const stroke = Math.max(1.5, size * 0.095);
  const line = { backgroundColor: color, borderRadius: stroke };

  switch (name) {
    case 'search':
      return (
        <View style={{ width: size, height: size }}>
          <View
            style={{
              position: 'absolute',
              left: size * 0.08,
              top: size * 0.06,
              width: size * 0.6,
              height: size * 0.6,
              borderWidth: stroke,
              borderColor: color,
              borderRadius: size,
            }}
          />
          <View
            style={[
              line,
              {
                position: 'absolute',
                width: size * 0.39,
                height: stroke,
                left: size * 0.55,
                top: size * 0.71,
                transform: [{ rotate: '45deg' }],
              },
            ]}
          />
        </View>
      );
    case 'filter':
      return (
        <View
          style={{
            width: size,
            height: size,
            justifyContent: 'center',
            gap: size * 0.19,
          }}
        >
          {[0.8, 0.58, 0.9].map((width, index) => (
            <View
              key={index}
              style={{
                width: size * width,
                height: stroke,
                borderRadius: stroke,
                backgroundColor: color,
                alignSelf: index === 1 ? 'flex-end' : 'flex-start',
              }}
            />
          ))}
        </View>
      );
    case 'calendar':
      return (
        <View
          style={{
            width: size * 0.86,
            height: size * 0.82,
            marginTop: size * 0.12,
            borderWidth: stroke,
            borderColor: color,
            borderRadius: size * 0.16,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: size * 0.27,
              left: 0,
              right: 0,
              height: stroke,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: -size * 0.18,
              left: size * 0.2,
              width: stroke,
              height: size * 0.32,
              borderRadius: stroke,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: -size * 0.18,
              right: size * 0.2,
              width: stroke,
              height: size * 0.32,
              borderRadius: stroke,
              backgroundColor: color,
            }}
          />
        </View>
      );
    case 'plus':
      return (
        <View
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={[line, { width: size * 0.76, height: stroke }]} />
          <View
            style={[
              line,
              { width: stroke, height: size * 0.76, position: 'absolute' },
            ]}
          />
        </View>
      );
    case 'close':
      return (
        <View
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={[
              line,
              {
                width: size * 0.76,
                height: stroke,
                transform: [{ rotate: '45deg' }],
              },
            ]}
          />
          <View
            style={[
              line,
              {
                width: size * 0.76,
                height: stroke,
                position: 'absolute',
                transform: [{ rotate: '-45deg' }],
              },
            ]}
          />
        </View>
      );
    case 'edit':
      return (
        <View style={{ width: size, height: size }}>
          <View
            style={[
              line,
              {
                position: 'absolute',
                left: size * 0.39,
                top: size * 0.08,
                width: size * 0.18,
                height: size * 0.72,
                transform: [{ rotate: '42deg' }],
              },
            ]}
          />
          <View
            style={{
              position: 'absolute',
              left: size * 0.11,
              bottom: size * 0.1,
              width: size * 0.28,
              height: stroke,
              backgroundColor: color,
              borderRadius: stroke,
              transform: [{ rotate: '-8deg' }],
            }}
          />
        </View>
      );
    case 'delete':
      return (
        <View style={{ width: size, height: size, alignItems: 'center' }}>
          <View
            style={[
              line,
              { width: size * 0.55, height: stroke, marginTop: size * 0.23 },
            ]}
          />
          <View
            style={{
              width: size * 0.42,
              height: size * 0.52,
              marginTop: size * 0.06,
              borderWidth: stroke,
              borderTopWidth: 0,
              borderColor: color,
              borderBottomLeftRadius: size * 0.12,
              borderBottomRightRadius: size * 0.12,
            }}
          />
          <View
            style={[
              line,
              {
                position: 'absolute',
                top: size * 0.08,
                width: size * 0.25,
                height: stroke,
              },
            ]}
          />
        </View>
      );
    case 'clock':
      return (
        <View
          style={{
            width: size * 0.84,
            height: size * 0.84,
            borderRadius: size,
            borderWidth: stroke,
            borderColor: color,
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: size * 0.36,
              top: size * 0.17,
              width: stroke,
              height: size * 0.27,
              backgroundColor: color,
              borderRadius: stroke,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: size * 0.36,
              top: size * 0.39,
              width: size * 0.24,
              height: stroke,
              backgroundColor: color,
              borderRadius: stroke,
              transform: [{ rotate: '28deg' }],
            }}
          />
        </View>
      );
    case 'arrowLeft':
    case 'arrowRight': {
      const rotation = name === 'arrowLeft' ? '180deg' : '0deg';
      return (
        <View
          style={{
            width: size,
            height: size,
            justifyContent: 'center',
            transform: [{ rotate: rotation }],
          }}
        >
          <View style={[line, { width: size * 0.76, height: stroke }]} />
          <View
            style={[
              line,
              {
                position: 'absolute',
                right: size * 0.08,
                top: size * 0.28,
                width: size * 0.38,
                height: stroke,
                transform: [{ rotate: '42deg' }],
              },
            ]}
          />
          <View
            style={[
              line,
              {
                position: 'absolute',
                right: size * 0.08,
                bottom: size * 0.28,
                width: size * 0.38,
                height: stroke,
                transform: [{ rotate: '-42deg' }],
              },
            ]}
          />
        </View>
      );
    }
    case 'check':
      return (
        <View style={{ width: size, height: size }}>
          <View
            style={[
              line,
              {
                position: 'absolute',
                left: size * 0.08,
                top: size * 0.53,
                width: size * 0.38,
                height: stroke,
                transform: [{ rotate: '45deg' }],
              },
            ]}
          />
          <View
            style={[
              line,
              {
                position: 'absolute',
                left: size * 0.29,
                top: size * 0.44,
                width: size * 0.66,
                height: stroke,
                transform: [{ rotate: '-48deg' }],
              },
            ]}
          />
        </View>
      );
  }
}
