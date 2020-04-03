<?php
/**
 * @file
 * es_site_announcement_source.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function es_site_announcement_source_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_views_api().
 */
function es_site_announcement_source_views_api($module = NULL, $api = NULL) {
  return array("api" => "3.0");
}

/**
 * Implements hook_node_info().
 */
function es_site_announcement_source_node_info() {
  $items = array(
    'announcement' => array(
      'name' => t('Announcement'),
      'base' => 'node_content',
      'description' => t('This is a cross-site announcement that will be applied to all microsites and property pages. Use with caution. '),
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => t('This is a cross-site announcement that will be applied to all microsites and property pages. Use with caution. '),
    ),
  );
  drupal_alter('node_info', $items);
  return $items;
}
