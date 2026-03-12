import 'package:flutter/material.dart';

abstract class SolanmarketColors {
  static const cream = Color(0xFFF7F3EE);
  static const blush = Color(0xFFF2E8E1);
  static const sage = Color(0xFFD6E4D8);
  static const lavender = Color(0xFFE8E2F4);
  static const accent = Color(0xFF9B6B9B);
  static const accentL = Color(0xFFC49BCE);
  static const dark = Color(0xFF2A2430);
  static const muted = Color(0xFF7A7085);
}

abstract class SolanmarketTheme {
  static ThemeData light() => ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: SolanmarketColors.cream,
    colorScheme:
        ColorScheme.fromSeed(
          seedColor: SolanmarketColors.accent,
          brightness: Brightness.light,
        ).copyWith(
          primary: SolanmarketColors.accent,
          onPrimary: Colors.white,
          secondary: SolanmarketColors.accentL,
          surface: Colors.white,
        ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        fontSize: 48,
        fontWeight: FontWeight.w600,
        color: SolanmarketColors.dark,
        letterSpacing: -0.5,
      ),
      titleLarge: TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: SolanmarketColors.dark,
      ),
      titleMedium: TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w500,
        color: SolanmarketColors.dark,
      ),
      bodyLarge: TextStyle(fontSize: 16, color: SolanmarketColors.dark),
      bodyMedium: TextStyle(fontSize: 14, color: SolanmarketColors.dark),
      bodySmall: TextStyle(fontSize: 12, color: SolanmarketColors.muted),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: SolanmarketColors.cream,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: SolanmarketColors.dark,
      ),
      iconTheme: IconThemeData(color: SolanmarketColors.dark),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: SolanmarketColors.accent,
        foregroundColor: Colors.white,
        shape: const StadiumBorder(),
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: SolanmarketColors.accent,
        side: const BorderSide(color: SolanmarketColors.accent),
        shape: const StadiumBorder(),
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE0D9D0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE0D9D0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(
          color: SolanmarketColors.accent,
          width: 1.5,
        ),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFEDE7DF)),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: SolanmarketColors.accent,
      unselectedItemColor: SolanmarketColors.muted,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
    ),
    chipTheme: ChipThemeData(
      backgroundColor: SolanmarketColors.blush,
      selectedColor: SolanmarketColors.accent,
      labelStyle: const TextStyle(fontSize: 13, color: SolanmarketColors.dark),
      shape: const StadiumBorder(),
      padding: const EdgeInsets.symmetric(horizontal: 12),
    ),
  );
}
