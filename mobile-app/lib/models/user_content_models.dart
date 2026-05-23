class FavoriteItem {
  const FavoriteItem({
    required this.id,
    required this.createdAt,
    required this.organizationName,
    required this.organizationType,
  });

  final String id;
  final String createdAt;
  final String organizationName;
  final String organizationType;

  factory FavoriteItem.fromJson(Map<String, dynamic> json) {
    final organization = json['organizations'] as Map<String, dynamic>?;
    return FavoriteItem(
      id: json['id'] as String,
      createdAt: json['created_at'] as String,
      organizationName: organization?['name'] as String? ?? 'Organization',
      organizationType: organization?['type'] as String? ?? '-',
    );
  }
}

class BookingItem {
  const BookingItem({
    required this.id,
    required this.scheduledAt,
    required this.status,
    this.note,
    this.organizationName,
    this.serviceName,
  });

  final String id;
  final String scheduledAt;
  final String status;
  final String? note;
  final String? organizationName;
  final String? serviceName;

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    final organization = json['organizations'] as Map<String, dynamic>?;
    final service = json['services'] as Map<String, dynamic>?;
    return BookingItem(
      id: json['id'] as String,
      scheduledAt: json['scheduled_at'] as String,
      status: json['status'] as String,
      note: json['note'] as String?,
      organizationName: organization?['name'] as String?,
      serviceName: service?['name'] as String?,
    );
  }
}
