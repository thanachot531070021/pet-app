class NewsModel {
  const NewsModel({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    required this.status,
    this.coverImage,
    this.publishedAt,
  });

  final String id;
  final String title;
  final String content;
  final String type;
  final String status;
  final String? coverImage;
  final DateTime? publishedAt;

  factory NewsModel.fromJson(Map<String, dynamic> json) {
    return NewsModel(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      coverImage: json['cover_image'] as String?,
      publishedAt: json['published_at'] == null
          ? null
          : DateTime.tryParse(json['published_at'] as String),
    );
  }
}
