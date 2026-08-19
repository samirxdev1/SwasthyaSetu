import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BottomTabInset } from '@/constants/theme';

const TabIcon = ({
  focused,
  icon,
  label,
}: {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) => {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={icon}
        size={22}
        color={focused ? Colors.primary : Colors.textSecondary}
      />
      <Text
        style={{
          fontSize: Typography.caption.fontSize,
          fontWeight: focused ? '700' : '500',
          color: focused ? Colors.primary : Colors.textSecondary,
          marginTop: 2,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: Platform.select({ ios: 84, android: 72, web: 72, default: 72 }),
          paddingBottom: Platform.select({ ios: BottomTabInset - 10, default: Spacing.sm }),
          paddingTop: Spacing.sm,
          elevation: 8,
          shadowColor: Colors.text,
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 10,
        },
        tabBarLabelStyle: { display: 'none' },
        tabBarItemStyle: { paddingVertical: 0, paddingTop: 4 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="home" label="Home" />,
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="folder-open" label="Records" />,
          tabBarLabel: 'Records',
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="scan" label="Scan" />,
          tabBarLabel: 'Scan',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="chatbubble-ellipses" label="Chat" />,
          tabBarLabel: 'Chat',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="person" label="Profile" />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    gap: 2,
  },
});
