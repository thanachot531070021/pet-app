import 'package:flutter/material.dart';

import '../../models/organization_detail_model.dart';
import '../../models/service_model.dart';
import '../../services/mobile_api_service.dart';
import '../shared/app_image.dart';
import '../shared/async_state_view.dart';

class OrganizationDetailScreen extends StatefulWidget {
  const OrganizationDetailScreen({
    required this.api,
    required this.type,
    required this.id,
    super.key,
  });

  final MobileApiService api;
  final String type;
  final String id;

  @override
  State<OrganizationDetailScreen> createState() =>
      _OrganizationDetailScreenState();
}

class _OrganizationDetailScreenState extends State<OrganizationDetailScreen> {
  late Future<OrganizationDetailModel> _future;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _future = widget.api.getOrganizationDetail(widget.type, widget.id);
  }

  void _requireLogin() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Please sign in from Profile first.')),
    );
  }

  Future<void> _favorite(String organizationId) async {
    if (!widget.api.isSignedIn) {
      _requireLogin();
      return;
    }

    setState(() => _busy = true);
    try {
      await widget.api.addFavorite(organizationId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Added to favorites')),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _review(String organizationId) async {
    if (!widget.api.isSignedIn) {
      _requireLogin();
      return;
    }

    final comment = await _textDialog(
      title: 'Review',
      label: 'Comment',
      initialValue: 'Great service',
    );
    if (comment == null) return;

    setState(() => _busy = true);
    try {
      await widget.api.createReview(
        organizationId: organizationId,
        rating: 5,
        comment: comment,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Review submitted')),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _book(String organizationId, ServiceModel? service) async {
    if (!widget.api.isSignedIn) {
      _requireLogin();
      return;
    }

    final note = await _textDialog(
      title: 'Booking',
      label: 'Note',
      initialValue: service == null ? 'Preferred time tomorrow' : service.name,
    );
    if (note == null) return;

    setState(() => _busy = true);
    try {
      await widget.api.createBooking(
        organizationId: organizationId,
        serviceId: service?.id,
        scheduledAt: DateTime.now().add(const Duration(days: 1)),
        note: note,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Booking created for tomorrow')),
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<String?> _textDialog({
    required String title,
    required String label,
    required String initialValue,
  }) {
    final controller = TextEditingController(text: initialValue);
    return showDialog<String>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(title),
          content: TextField(
            controller: controller,
            decoration: InputDecoration(labelText: label),
            maxLines: 3,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(controller.text),
              child: const Text('Submit'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AsyncStateView<OrganizationDetailModel>(
        future: _future,
        builder: (context, detail) {
          final org = detail.organization;
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 240,
                pinned: true,
                title: Text(org.name),
                flexibleSpace: FlexibleSpaceBar(
                  background: AppImage(
                    url: org.coverUrl ?? org.logoUrl,
                    icon: widget.type == 'clinics'
                        ? Icons.local_hospital
                        : Icons.storefront,
                    height: 240,
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        org.name,
                        style: Theme.of(context)
                            .textTheme
                            .headlineSmall
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: [
                          Chip(label: Text(org.type)),
                          Chip(label: Text(org.status)),
                          Chip(label: Text('${detail.reviewCount} reviews')),
                          if (org.province != null)
                            Chip(label: Text(org.province!)),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Text(org.description ?? 'No description yet.'),
                      const SizedBox(height: 16),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          FilledButton.icon(
                            onPressed: _busy ? null : () => _favorite(org.id),
                            icon: const Icon(Icons.favorite_border),
                            label: const Text('Favorite'),
                          ),
                          FilledButton.tonalIcon(
                            onPressed: _busy ? null : () => _review(org.id),
                            icon: const Icon(Icons.rate_review_outlined),
                            label: const Text('Review'),
                          ),
                          FilledButton.tonalIcon(
                            onPressed: _busy
                                ? null
                                : () => _book(
                                      org.id,
                                      detail.services.isEmpty
                                          ? null
                                          : detail.services.first,
                                    ),
                            icon: const Icon(Icons.calendar_month_outlined),
                            label: const Text('Book'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Services',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const SizedBox(height: 10),
                      if (detail.services.isEmpty)
                        const Card(
                          child: ListTile(
                            leading: Icon(Icons.design_services_outlined),
                            title: Text('No services yet'),
                          ),
                        )
                      else
                        ...detail.services.map(
                          (service) => Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            child: ListTile(
                              leading: const Icon(
                                Icons.design_services_outlined,
                              ),
                              title: Text(service.name),
                              subtitle: Text(
                                service.description ?? service.status,
                              ),
                              trailing: Text(
                                service.price == null
                                    ? '-'
                                    : service.price.toString(),
                              ),
                              onTap:
                                  _busy ? null : () => _book(org.id, service),
                            ),
                          ),
                        ),
                      const SizedBox(height: 24),
                      _InfoTile(
                        icon: Icons.place_outlined,
                        title: 'Address',
                        value: org.address ?? '-',
                      ),
                      _InfoTile(
                        icon: Icons.phone_outlined,
                        title: 'Phone',
                        value: org.phone ?? '-',
                      ),
                      _InfoTile(
                        icon: Icons.mail_outline,
                        title: 'Email',
                        value: org.email ?? '-',
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: org.phone == null ? null : () {},
                          icon: const Icon(Icons.call),
                          label: const Text('Contact'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.icon,
    required this.title,
    required this.value,
  });

  final IconData icon;
  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        subtitle: Text(value),
      ),
    );
  }
}
