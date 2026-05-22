import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                    child: const Icon(Icons.person, size: 34),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Guest user',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Favorites, booking, reviews, and membership will be added after public browsing is stable.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Card(
            child: ListTile(
              leading: Icon(Icons.favorite_border),
              title: Text('Favorites'),
              subtitle: Text('Coming soon'),
            ),
          ),
          const Card(
            child: ListTile(
              leading: Icon(Icons.calendar_month_outlined),
              title: Text('Bookings'),
              subtitle: Text('Coming soon'),
            ),
          ),
        ],
      ),
    );
  }
}
