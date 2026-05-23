import 'package:flutter/material.dart';

import '../../models/organization_model.dart';
import '../../services/mobile_api_service.dart';
import '../shared/app_image.dart';
import '../shared/async_state_view.dart';
import 'organization_detail_screen.dart';

class OrganizationListScreen extends StatefulWidget {
  const OrganizationListScreen({
    required this.api,
    required this.type,
    required this.title,
    super.key,
  });

  final MobileApiService api;
  final String type;
  final String title;

  @override
  State<OrganizationListScreen> createState() => _OrganizationListScreenState();
}

class _OrganizationListScreenState extends State<OrganizationListScreen> {
  late Future<List<OrganizationModel>> _future;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _future = widget.api.getOrganizations(widget.type);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: AsyncStateView<List<OrganizationModel>>(
        future: _future,
        builder: (context, items) {
          final filtered = items
              .where(
                (item) =>
                    item.name.toLowerCase().contains(_query.toLowerCase()),
              )
              .toList();

          return RefreshIndicator(
            onRefresh: () async => setState(
              () => _future = widget.api.getOrganizations(
                widget.type,
                search: _query,
              ),
            ),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              children: [
                TextField(
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search),
                    hintText: 'Search ${widget.title.toLowerCase()}',
                  ),
                  onSubmitted: (value) => setState(() {
                    _query = value;
                    _future = widget.api.getOrganizations(
                      widget.type,
                      search: value,
                    );
                  }),
                ),
                const SizedBox(height: 14),
                ...filtered.map(
                  (item) => Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(8),
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => OrganizationDetailScreen(
                            api: widget.api,
                            type: widget.type,
                            id: item.id,
                          ),
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 92,
                              child: AppImage(
                                url: item.logoUrl ?? item.coverUrl,
                                icon: widget.type == 'clinics'
                                    ? Icons.local_hospital
                                    : Icons.storefront,
                                height: 92,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.name,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(fontWeight: FontWeight.w800),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    item.description ??
                                        item.address ??
                                        item.province ??
                                        item.type,
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 10),
                                  Wrap(
                                    spacing: 8,
                                    children: [
                                      Chip(label: Text(item.type)),
                                      if (item.phone != null)
                                        Chip(label: Text(item.phone!)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                if (filtered.isEmpty)
                  const Padding(
                    padding: EdgeInsets.only(top: 80),
                    child: Center(child: Text('No records found')),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
