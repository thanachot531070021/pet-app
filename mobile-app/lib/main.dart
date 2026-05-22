import 'package:flutter/material.dart';

import 'core/api/api_client.dart';
import 'core/theme/app_theme.dart';
import 'features/app_shell.dart';
import 'services/mobile_api_service.dart';

void main() {
  runApp(const PetApp());
}

class PetApp extends StatelessWidget {
  const PetApp({super.key});

  @override
  Widget build(BuildContext context) {
    final api = MobileApiService(ApiClient());

    return MaterialApp(
      title: 'Pet App',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: AppShell(api: api),
    );
  }
}
