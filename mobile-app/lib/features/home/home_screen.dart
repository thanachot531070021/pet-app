import 'package:flutter/material.dart';

import '../../models/home_model.dart';
import '../../models/news_model.dart';
import '../../models/organization_model.dart';
import '../../services/mobile_api_service.dart';
import '../news/news_detail_screen.dart';
import '../organizations/organization_detail_screen.dart';
import '../shared/app_image.dart';
import '../shared/async_state_view.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({required this.api, super.key});

  final MobileApiService api;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<HomeModel> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.api.getHome();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pet App'),
        actions: [
          IconButton(
            onPressed: () => setState(() => _future = widget.api.getHome()),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: AsyncStateView<HomeModel>(
        future: _future,
        builder: (context, home) => RefreshIndicator(
          onRefresh: () async => setState(() => _future = widget.api.getHome()),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              if (home.banners.isNotEmpty) ...[
                SizedBox(
                  height: 156,
                  child: PageView(
                    children: home.banners
                        .map(
                          (banner) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: Stack(
                              fit: StackFit.expand,
                              children: [
                                AppImage(
                                  url: banner.imageUrl,
                                  icon: Icons.pets,
                                  height: 156,
                                ),
                                Positioned(
                                  left: 14,
                                  right: 14,
                                  bottom: 14,
                                  child: Text(
                                    banner.title,
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800,
                                      shadows: const [
                                        Shadow(blurRadius: 12),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                        .toList(),
                  ),
                ),
                const SizedBox(height: 22),
              ],
              _SectionHeader(
                title: 'Recommended shops',
                count: home.shops.length,
              ),
              const SizedBox(height: 10),
              _HorizontalOrganizations(
                organizations: home.shops,
                api: widget.api,
                type: 'shops',
              ),
              const SizedBox(height: 22),
              _SectionHeader(
                title: 'Clinics nearby',
                count: home.clinics.length,
              ),
              const SizedBox(height: 10),
              _HorizontalOrganizations(
                organizations: home.clinics,
                api: widget.api,
                type: 'clinics',
              ),
              const SizedBox(height: 22),
              _SectionHeader(
                title: 'News and promotions',
                count: home.news.length,
              ),
              const SizedBox(height: 10),
              ...home.news.map(
                (item) => _NewsTile(news: item, api: widget.api),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.count});

  final String title;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
          ),
        ),
        Text('$count'),
      ],
    );
  }
}

class _HorizontalOrganizations extends StatelessWidget {
  const _HorizontalOrganizations({
    required this.organizations,
    required this.api,
    required this.type,
  });

  final List<OrganizationModel> organizations;
  final MobileApiService api;
  final String type;

  @override
  Widget build(BuildContext context) {
    if (organizations.isEmpty) {
      return const _EmptyBox(text: 'No records yet');
    }

    return SizedBox(
      height: 214,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: organizations.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final org = organizations[index];
          return SizedBox(
            width: 220,
            child: Card(
              child: InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => OrganizationDetailScreen(
                      api: api,
                      type: type,
                      id: org.id,
                    ),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppImage(
                        url: org.coverUrl ?? org.logoUrl,
                        icon: Icons.storefront,
                        height: 106,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        org.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        org.address ?? org.province ?? org.type,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _NewsTile extends StatelessWidget {
  const _NewsTile({required this.news, required this.api});

  final NewsModel news;
  final MobileApiService api;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(
          child: Text(news.type.characters.first.toUpperCase()),
        ),
        title: Text(news.title),
        subtitle: Text(
          news.content,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => NewsDetailScreen(api: api, id: news.id),
          ),
        ),
      ),
    );
  }
}

class _EmptyBox extends StatelessWidget {
  const _EmptyBox({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 96,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE1E7EC)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(text),
    );
  }
}
