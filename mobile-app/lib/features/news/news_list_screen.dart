import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../models/news_model.dart';
import '../../services/mobile_api_service.dart';
import '../shared/async_state_view.dart';
import 'news_detail_screen.dart';

class NewsListScreen extends StatefulWidget {
  const NewsListScreen({required this.api, super.key});

  final MobileApiService api;

  @override
  State<NewsListScreen> createState() => _NewsListScreenState();
}

class _NewsListScreenState extends State<NewsListScreen> {
  late Future<List<NewsModel>> _future;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _future = widget.api.getNews();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('News')),
      body: AsyncStateView<List<NewsModel>>(
        future: _future,
        builder: (context, news) => RefreshIndicator(
            onRefresh: () async => setState(() => _future = widget.api.getNews(search: _query)),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              TextField(
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.search),
                  hintText: 'Search news',
                ),
                onSubmitted: (value) => setState(() {
                  _query = value;
                  _future = widget.api.getNews(search: value);
                }),
              ),
              const SizedBox(height: 14),
              ...news.map(
                (item) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(14),
                    title: Text(item.title),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        item.publishedAt == null
                            ? item.type
                            : '${item.type} · ${DateFormat.yMMMd().format(item.publishedAt!)}',
                      ),
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => NewsDetailScreen(api: widget.api, id: item.id)),
                    ),
                  ),
                ),
              ),
              if (news.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 80),
                  child: Center(child: Text('No news found')),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
