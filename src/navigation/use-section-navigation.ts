import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, PanResponder } from 'react-native';
import { motion } from '../design-system';
import { appTabs, type AppTab } from './tabs';

export function useSectionNavigation({
  activeTab,
  isWide,
  setActiveTab,
  width,
}: {
  activeTab: AppTab;
  isWide: boolean;
  setActiveTab: (tab: AppTab) => void;
  width: number;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const slideX = useRef(new Animated.Value(0)).current;
  const sectionOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  function navigateTo(tab: AppTab) {
    if (tab === activeTab) return;

    if (isWide || reduceMotion) {
      slideX.stopAnimation();
      sectionOpacity.stopAnimation();
      slideX.setValue(0);
      sectionOpacity.setValue(1);
      setActiveTab(tab);
      return;
    }

    const currentIndex = appTabs.findIndex((item) => item.id === activeTab);
    const nextIndex = appTabs.findIndex((item) => item.id === tab);
    const direction = nextIndex > currentIndex ? 1 : -1;

    slideX.stopAnimation();
    sectionOpacity.stopAnimation();
    slideX.setValue(direction * Math.min(width * motion.enterDistanceRatio, motion.enterDistanceMax));
    sectionOpacity.setValue(motion.enterOpacity);
    setActiveTab(tab);

    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(slideX, {
          toValue: 0,
          ...motion.navigationSpring,
          overshootClamping: true,
          restDisplacementThreshold: 0.2,
          restSpeedThreshold: 0.2,
          useNativeDriver: true,
        }),
        Animated.timing(sectionOpacity, {
          toValue: 1,
          duration: 170,
          easing: Easing.bezier(0.23, 1, 0.32, 1),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }

  function returnToRest() {
    if (reduceMotion) {
      slideX.setValue(0);
      sectionOpacity.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.spring(slideX, {
        toValue: 0,
        ...motion.returnSpring,
        overshootClamping: true,
        useNativeDriver: true,
      }),
      Animated.timing(sectionOpacity, {
        toValue: 1,
        duration: 140,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      !isWide && gesture.numberActiveTouches === 1 && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
    onMoveShouldSetPanResponderCapture: (_, gesture) =>
      !isWide && gesture.numberActiveTouches === 1 && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
    onPanResponderGrant: () => {
      slideX.stopAnimation();
      sectionOpacity.stopAnimation();
    },
    onPanResponderMove: (_, gesture) => {
      if (gesture.numberActiveTouches !== 1 || reduceMotion) return;

      const currentIndex = appTabs.findIndex((item) => item.id === activeTab);
      const isPastFirst = currentIndex === 0 && gesture.dx > 0;
      const isPastLast = currentIndex === appTabs.length - 1 && gesture.dx < 0;
      const resistance = isPastFirst || isPastLast ? motion.edgeResistance : 1;
      const maxTravel = width * motion.swipeDistanceRatio;
      const travel = Math.max(-maxTravel, Math.min(maxTravel, gesture.dx * resistance));

      slideX.setValue(travel);
      sectionOpacity.setValue(1 - Math.min(Math.abs(travel) / maxTravel, 1) * 0.14);
    },
    onPanResponderRelease: (_, gesture) => {
      const currentIndex = appTabs.findIndex((item) => item.id === activeTab);
      const threshold = Math.min(width * motion.swipeThresholdRatio, motion.swipeThresholdMax);
      const isFastSwipe = Math.abs(gesture.vx) > motion.swipeVelocity;
      const shouldNavigate = Math.abs(gesture.dx) > threshold || isFastSwipe;
      const directionValue = isFastSwipe ? gesture.vx : gesture.dx;
      const targetIndex = currentIndex + (directionValue < 0 ? 1 : -1);

      if (shouldNavigate && targetIndex >= 0 && targetIndex < appTabs.length) {
        navigateTo(appTabs[targetIndex].id);
        return;
      }

      returnToRest();
    },
    onPanResponderTerminate: returnToRest,
    onPanResponderTerminationRequest: () => false,
  });

  return {
    animatedStyle: { opacity: sectionOpacity, transform: [{ translateX: slideX }] },
    navigateTo,
    panHandlers: panResponder.panHandlers,
  };
}

