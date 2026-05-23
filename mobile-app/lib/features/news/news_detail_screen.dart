import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../models/news_model.dart';
import '../../services/mobile_api_service.dart';
import '../shared/app_image.dart';
import '../shared/async_state_view.dart';

class NewsDetailScreen extends StatefulWidget {
  const NewsDetailScreen({required this.api, required this.id, super.key});

  final MobileApiService api;
  final String id;

  @override
  State<NewsDetailScreen> createState() => _NewsDetailScreenState();
}

class _NewsDetailScreenState extends State<NewsDetailScreen> {
  late Future<NewsModel> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.api.getNewsDetail(widget.id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AsyncStateView<NewsModel>(
        future: _future,
        builder: (context, item) => CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 220,
              pinned: true,
              title: const Text('News'),
              flexibleSpace: FlexibleSpaceBar(
                background: AppImage(
                  url: item.coverImage,
                  icon: Icons.article,
                  height: 220,
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
                      item.title,
                      style: Theme.of(context)
                          .textTheme
                          .headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      children: [
                        Chip(label: Text(item.type)),
                        if (item.publishedAt != null)
                          Chip(
                            label: Text(
                              DateFormat.yMMMd().format(item.publishedAt!),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    Text(
                      item.content,
                      style: Theme.of(
                        context,
                      ).textTheme.bodyLarge?.copyWith(height: 1.45),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
