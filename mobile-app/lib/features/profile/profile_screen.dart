import 'package:flutter/material.dart';

import '../../models/auth_models.dart';
import '../../models/user_content_models.dart';
import '../../services/mobile_api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({required this.api, super.key});

  final MobileApiService api;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _emailController = TextEditingController(text: 'user@example.com');
  final _passwordController = TextEditingController(text: 'User@123456');
  final _nameController = TextEditingController(text: 'Pet Owner');
  final _phoneController = TextEditingController();

  AuthProfile? _profile;
  List<FavoriteItem> _favorites = const [];
  List<BookingItem> _bookings = const [];
  bool _signupMode = false;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _busy = true;
      _error = null;
    });

    try {
      final profile = _signupMode
          ? await widget.api.signup(
              email: _emailController.text.trim(),
              password: _passwordController.text,
              fullName: _nameController.text.trim(),
              phone: _phoneController.text.trim(),
            )
          : await widget.api.login(
              _emailController.text.trim(),
              _passwordController.text,
            );
      final favorites = await widget.api.getFavorites();
      final bookings = await widget.api.getBookings();
      if (!mounted) return;
      setState(() {
        _profile = profile;
        _favorites = favorites;
        _bookings = bookings;
      });
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _logout() {
    widget.api.logout();
    setState(() {
      _profile = null;
      _favorites = const [];
      _bookings = const [];
    });
  }

  @override
  Widget build(BuildContext context) {
    final profile = _profile;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (profile == null) _authCard(),
          if (profile != null)
            _ProfileCard(profile: profile, onLogout: _logout),
          const SizedBox(height: 12),
          if (profile != null) ...[
            _FavoritesCard(items: _favorites),
            const SizedBox(height: 12),
            _BookingsCard(items: _bookings),
          ],
        ],
      ),
    );
  }

  Widget _authCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: Theme.of(
                    context,
                  ).colorScheme.primaryContainer,
                  child: const Icon(Icons.person, size: 32),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    _signupMode ? 'Create account' : 'Sign in',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                ),
                TextButton(
                  onPressed: _busy
                      ? null
                      : () => setState(() => _signupMode = !_signupMode),
                  child: Text(_signupMode ? 'Login' : 'Signup'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_signupMode) ...[
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Full name'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Phone'),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 10),
            ],
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
              autofillHints: const [AutofillHints.password],
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _busy ? null : _submit,
              icon: _busy
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.login),
              label: Text(_signupMode ? 'Create account' : 'Sign in'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({required this.profile, required this.onLogout});

  final AuthProfile profile;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            CircleAvatar(
              radius: 30,
              backgroundColor: Theme.of(context).colorScheme.primaryContainer,
              child: const Icon(Icons.person, size: 34),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    profile.fullName ?? profile.email ?? 'Pet Owner',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(profile.email ?? profile.role),
                ],
              ),
            ),
            IconButton(
              onPressed: onLogout,
              icon: const Icon(Icons.logout),
              tooltip: 'Logout',
            ),
          ],
        ),
      ),
    );
  }
}

class _FavoritesCard extends StatelessWidget {
  const _FavoritesCard({required this.items});

  final List<FavoriteItem> items;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          const ListTile(
            leading: Icon(Icons.favorite_border),
            title: Text('Favorites'),
          ),
          if (items.isEmpty)
            const ListTile(title: Text('No favorites yet'))
          else
            for (final item in items)
              ListTile(
                title: Text(item.organizationName),
                subtitle: Text(item.organizationType),
              ),
        ],
      ),
    );
  }
}

class _BookingsCard extends StatelessWidget {
  const _BookingsCard({required this.items});

  final List<BookingItem> items;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          const ListTile(
            leading: Icon(Icons.calendar_month_outlined),
            title: Text('Bookings'),
          ),
          if (items.isEmpty)
            const ListTile(title: Text('No bookings yet'))
          else
            for (final item in items)
              ListTile(
                title: Text(
                  item.serviceName ?? item.organizationName ?? 'Booking',
                ),
                subtitle: Text('${item.status} - ${item.scheduledAt}'),
              ),
        ],
      ),
    );
  }
}
