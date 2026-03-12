import 'package:flutter/material.dart';
import 'core/di/injection.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureDependencies();
  runApp(const SolanmarketApp());
}

class SolanmarketApp extends StatelessWidget {
  const SolanmarketApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Solanmarket',
      debugShowCheckedModeBanner: false,
      theme: SolanmarketTheme.light(),
      routerConfig: AppRouter.router,
    );
  }
}
