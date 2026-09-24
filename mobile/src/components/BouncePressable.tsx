import React, { useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';

/** A small springy touch response shared by the app's secondary controls. */
export function BouncePressable({
  onPressIn,
  onPressOut,
  ...props
}: PressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const baseStyle =
    typeof props.style === 'function'
      ? undefined
      : StyleSheet.flatten(props.style as ViewStyle | ViewStyle[] | undefined);
  const layoutStyle: ViewStyle = {
    alignSelf: baseStyle?.alignSelf,
    flex: baseStyle?.flex,
    flexBasis: baseStyle?.flexBasis,
    flexGrow: baseStyle?.flexGrow,
    flexShrink: baseStyle?.flexShrink,
    width: baseStyle?.width,
    minWidth: baseStyle?.minWidth,
    maxWidth: baseStyle?.maxWidth,
    height: baseStyle?.height,
    minHeight: baseStyle?.minHeight,
    maxHeight: baseStyle?.maxHeight,
    margin: baseStyle?.margin,
    marginHorizontal: baseStyle?.marginHorizontal,
    marginVertical: baseStyle?.marginVertical,
    marginTop: baseStyle?.marginTop,
    marginBottom: baseStyle?.marginBottom,
    marginLeft: baseStyle?.marginLeft,
    marginRight: baseStyle?.marginRight,
  };
  const animate = (pressed: boolean) => {
    Animated.spring(scale, {
      toValue: pressed ? 0.91 : 1,
      speed: pressed ? 34 : 20,
      bounciness: pressed ? 0 : 16,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    animate(true);
    onPressIn?.(event);
  };
  const handlePressOut = (event: GestureResponderEvent) => {
    animate(false);
    onPressOut?.(event);
  };

  return (
    <Animated.View style={[layoutStyle, { transform: [{ scale }] }]}>
      <Pressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />
    </Animated.View>
  );
}
