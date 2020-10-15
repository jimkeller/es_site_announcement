<?php

namespace Drupal\es_site_announcement_source\Controller;

use Drupal\Core\Controller\ControllerBase;
use \Drupal\Core\Entity\EntityTypeManagerInterface; 
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Announcement API Controller
 */
class AnnouncementAPIController extends ControllerBase {

    protected $entityTypeManager;
    protected $_content_type_name = 'announcement';
  
    /**
     * Constructs a new AnnouncementAPIController object.
     *
     * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
     */
    public function __construct(EntityTypeManagerInterface $entityTypeManager) {
  
      $this->entityTypeManager = $entityTypeManager;

    }
  
    /**
     * {@inheritdoc}
     */
    public static function create( \Symfony\Component\DependencyInjection\ContainerInterface $container) {
      return new static(
        $container->get('entity_type.manager')
      );
    }

    /**
     * Returns JSON data for the latest announcement
     */
    public function announcements( $type ) {

        $data  = [];
        
        //
        // type param can only be alphanumeric, dashes, underscore
        //
        if ( $type && preg_match('/[^A-Za-z0-9_\-]/', $type) ) {
            throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException('Invalid type');
        }

        $query = $this->query_base();
        $query->condition('field_announcement_type', $type);
        $nids  = $query->execute();

        if ( count($nids) > 0 ) {

            $nodes = entity_load_multiple('node', $nids);

            foreach( $nodes as $node ) {
                $node_data = [];
                $node_data['title'] = $node->getTitle();
                $node_data['body'] = $node->body->value;
                $node_data['timestamp'] = $node->changed->value;
                $node_data['close_label'] = $node->field_announcement_close_label->value;
                $node_data['paths'] = [];
                
                if ( $node->field_announcement_paths->value ) {
                    $node_data['paths'] = explode( "\r\n", trim($node->field_announcement_paths->value) );
                }
                $data[] = $node_data;
            } 
        }

        return new JsonResponse([
            'announcements' => $data,
            'method' => 'GET',
        ]);
    }

    protected function query_base() {

        $storage = $this->entityTypeManager->getStorage('node');
        $query = $storage->getQuery()
        ->condition('status', 1)
        ->condition('type', $this->_content_type_name)
        ->sort('changed', 'desc')
        ->range(0, 1);

        return $query;


    }

}
