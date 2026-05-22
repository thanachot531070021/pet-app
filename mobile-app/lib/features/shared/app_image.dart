import 'package:flutter/material.dart';

class AppImage extends StatelessWidget {
  const AppImage({
    required this.url,
    required this.icon,
    this.height = 140,
    super.key,
  });

  final String? url;
  final IconData icon;
  final double height;

  @override
  Widget build(BuildContext context) {
    final imageUrl = url;
    if (imageUrl == null || imageUrl.isEmpty) {
      return Container(
        height: height,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 42),
      );
    }

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Image.network(
        imageUrl,
        height: height,
        width: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Container(
          height: height,
          color: Theme.of(context).colorScheme.primaryContainer,
          child: Icon(icon, size: 42),
        ),
      ),
    );
  }
}
