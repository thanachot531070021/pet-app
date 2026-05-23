import 'organization_model.dart';
import 'service_model.dart';

class OrganizationDetailModel {
  const OrganizationDetailModel({
    required this.organization,
    required this.services,
    required this.reviewCount,
  });

  final OrganizationModel organization;
  final List<ServiceModel> services;
  final int reviewCount;

  factory OrganizationDetailModel.fromJson(Map<String, dynamic> json) {
    final services = json['services'];
    return OrganizationDetailModel(
      organization: OrganizationModel.fromJson(
        json['organization'] as Map<String, dynamic>,
      ),
      services: services is List
          ? services
              .whereType<Map<String, dynamic>>()
              .map(ServiceModel.fromJson)
              .toList()
          : const [],
      reviewCount: json['reviewCount'] as int? ?? 0,
    );
  }
}
