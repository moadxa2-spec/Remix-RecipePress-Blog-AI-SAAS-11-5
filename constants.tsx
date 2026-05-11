import React from 'react';

export const HTACCESS_RULES = `
# BEGIN RecipePress AI Rules
<IfModule mod_headers.c>
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "POST, GET, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
# END RecipePress AI Rules
`;

export const Icons = {
    add: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>,
    copy: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>,
    check: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
    book: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" /></svg>,
    ebook: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    cog: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734-2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379-1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
    question: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
    pencil: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>,
    shieldCheck: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.05l.01.01A12.062 12.062 0 0110 18.451a12.062 12.062 0 017.824-13.39l.01-.01A11.954 11.954 0 0110 1.944zM9 13.01l-3-3.01a1 1 0 111.414-1.414l2.293 2.293 4.293-4.293a1 1 0 111.414 1.414l-5 5.01a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>,
    arrowUp: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>,
    arrowDown: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
    server: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>,
    key: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>,
    history: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    globe: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9h18" /></svg>,
    code: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    academicCap: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v6m-8-8v-5.428a2 2 0 01.996-1.732l6-3.428a2 2 0 012.008 0l6 3.428A2 2 0 0120 8.572V12m-4-2v-3.882a1 1 0 00-.5-.866L12 3.236 8.5 5.252a1 1 0 00-.5.866V10" /></svg>,
    photo: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>,
    sparkles: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 13.5l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 18l-1.035.259a3.375 3.375 0 00-2.456 2.456L18 21.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 18l1.035-.259a3.375 3.375 0 002.456-2.456L18 13.5z" /></svg>,
    beaker: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.443 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.443a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.443-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l2.387.443a2 2 0 001.806.547 2 2 0 00.547-1.806l-.443-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l2.387.443a2 2 0 001.806-.547" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.572 8.572a2 2 0 00.547-1.806l-.443-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l-2.387.443a2 2 0 00-.547 1.806 2 2 0 00.547 1.806l.443 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.443a2 2 0 001.806-.547" /></svg>,
    exclamationCircle: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
    upload: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>,
    documentSearch: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l-2.293-2.293a1 1 0 010-1.414l7-7a1 1 0 011.414 0l7 7a1 1 0 010 1.414L15 21m-5-4h2" /></svg>,
    user: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5.414l7.293 7.293a1 1 0 001.414-1.414L6.414 4H15a1 1 0 100-2H4a1 1 0 00-1 1z" clipRule="evenodd" /></svg>,
    bell: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    arrowRight: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
    shieldExclamation: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.05l.01.01A12.062 12.062 0 0110 18.451a12.062 12.062 0 017.824-13.39l.01-.01A11.954 11.954 0 0110 1.944zM10 14a1 1 0 110-2 1 1 0 010 2zm-1-1a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1zm-1-4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
    users: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.176-5.97M15 21H9" /></svg>,
    currencyDollar: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 12v-2m0 2v.01M12 12a2 2 0 100 4 2 2 0 000-4zm0 0a2 2 0 110 4 2 2 0 010-4zm0 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    inbox: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
    ticket: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
    trendingUp: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    reply: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
};

export const PLUGIN_PHP_CODE = `<?php
/**
 * Plugin Name:       RecipePress Blog AI Connector
 * Description:       Provides secure API endpoints for the RecipePress Blog AI app to fetch posts and import recipes. Automatically configures CORS on activation.
 * Version:           2.28.0
 * Author:            RecipePress Blog AI Team
 * License:           GPL-2.0-or-later
 */

if ( ! defined( 'ABSPATH' ) ) exit;

final class RecipePress_AI_Connector_Remote {
    private static $instance;
    public static function instance() {
        if ( is_null( self::$instance ) ) self::$instance = new self();
        return self::$instance;
    }

    private $option_group = 'recipepress_ai_group';
    private $menu_slug = 'recipepress-ai-dashboard';

    private function __construct() {
        add_action( 'admin_menu', [ $this, 'admin_menu' ] );
        add_action( 'admin_init', [ $this, 'settings_init' ] );
        add_action( 'rest_api_init', [ $this, 'add_cors_headers' ] );
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
        add_action( 'wp_ajax_rpai_generate_token', [ $this, 'ajax_generate_token' ] );
    }

    public static function activate() {
        require_once( ABSPATH . 'wp-admin/includes/misc.php' );
        require_once( ABSPATH . 'wp-admin/includes/file.php' );
        $htaccess_file = get_home_path() . '.htaccess';
        $rules = [
            '<IfModule mod_headers.c>',
            'Header set Access-Control-Allow-Origin "*"',
            'Header set Access-Control-Allow-Methods "POST, GET, OPTIONS"',
            'Header set Access-Control-Allow-Headers "Content-Type, Authorization"',
            '</IfModule>'
        ];
        insert_with_markers( $htaccess_file, 'RecipePress AI Rules', $rules );
    }

    public static function deactivate() {
        require_once( ABSPATH . 'wp-admin/includes/misc.php' );
        require_once( ABSPATH . 'wp-admin/includes/file.php' );
        $htaccess_file = get_home_path() . '.htaccess';
        insert_with_markers( $htaccess_file, 'RecipePress AI Rules', [] );
    }

    public function add_cors_headers() {
        add_filter( 'rest_pre_serve_request', function ( $served, $result, $request ) {
            if ( strpos( $request->get_route(), '/recipepress-ai/v1' ) !== false ) {
                header( 'Access-Control-Allow-Origin: *' );
                header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
                header( 'Access-Control-Allow-Headers: Content-Type, Authorization' );
            }
            return $served;
        }, 10, 3 );
    }

    private function log_debug($message) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $log_file = WP_CONTENT_DIR . '/uploads/recipepress-atf.log';
            $formatted_message = '[' . date('Y-m-d H:i:s') . '] ' . (is_array($message) || is_object($message) ? print_r($message, true) : $message) . "\\n";
            @file_put_contents($log_file, $formatted_message, FILE_APPEND);
        }
    }

    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_' . $this->menu_slug) {
            return;
        }

        wp_register_style('recipepress-admin-styles', false);
        wp_enqueue_style('recipepress-admin-styles');
        $css = "
            :root { 
                --rp-bg: #ffffff;
                --rp-card-bg: #ffffff;
                --rp-border: #e2e8f0;
                --rp-input-bg: #ffffff;
                --rp-text-heading: #1e293b;
                --rp-text-body: #475569;
                --rp-text-label: #334155;
                --rp-accent: #8B5CF6;
                --rp-accent-hover: #7C3AED;
            }
            html, body, #wpbody-content { background-color: var(--rp-bg); }
            #wpcontent { padding-left: 0; }
            #wpfooter { display: none; }
            .wrap.recipepress-dashboard {
                background-color: var(--rp-bg); color: var(--rp-text-body);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
                margin: 2rem auto; padding: 2rem; max-width: 1280px; box-sizing: border-box;
            }
            .recipepress-main-header { background-color: var(--rp-card-bg); border-radius: 0.75rem; padding: 1.5rem 2rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 1px solid var(--rp-border); }
            .recipepress-logo-wrapper { width: 48px; height: 48px; background-color: var(--rp-accent); border-radius: 0.5rem; display:flex; align-items:center; justify-content: center; flex-shrink: 0; }
            .recipepress-logo { width: 32px; height: 32px; }
            .recipepress-main-header h1 { font-size: 1.875rem; font-weight: 700; color: var(--rp-text-heading); margin: 0; line-height: 1.2; }
            .recipepress-main-header p { font-size: 1rem; color: var(--rp-text-body); margin: 0.25rem 0 0; }
            .recipepress-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
            @media (min-width: 768px) { .recipepress-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; } }
            .recipepress-card { background: var(--rp-card-bg); border-radius: 0.75rem; border: 1px solid var(--rp-border); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); padding: 2rem; display: flex; flex-direction: column; height: 100%; }
            .recipepress-card h2 { font-size: 1.25rem; font-weight: 600; color: var(--rp-text-heading); margin: 0; }
            .recipepress-card .card-description { font-size: 0.875rem; color: var(--rp-text-body); margin: 0.25rem 0 1.5rem; }
            .recipepress-card .card-content { flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
            .form-group { margin-bottom: 1.5rem; }
            .form-group:last-of-type { margin-bottom: 0; }
            .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--rp-text-label); font-size: 0.875rem; }
            .form-group .description { font-size: 0.875rem; color: var(--rp-text-body); margin-top: 0.5rem; }
            input[type='text'].token-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--rp-border); border-radius: 0.375rem; background: var(--rp-input-bg); font-size: 0.875rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); color: var(--rp-text-body); transition: border-color 0.2s, box-shadow 0.2s; }
            .recipepress-select-wrapper { position: relative; }
            select.recipepress-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; width: 100%; padding: 0.5rem 2.5rem 0.5rem 0.75rem; border: 1px solid var(--rp-border); border-radius: 0.375rem; background-color: var(--rp-input-bg); font-size: 0.875rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); color: var(--rp-text-body); transition: border-color 0.2s, box-shadow 0.2s; background-image: url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1em; }
            input[type='text'].token-input:focus, select.recipepress-select:focus { outline: none; border-color: var(--rp-accent); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2); }
            input[type='text'][readonly].token-input { background-color: #f8fafc; font-family: monospace; }
            .token-wrapper { display: flex; gap: 0.5rem; }
            .token-wrapper .button { white-space: nowrap; background-color: #f1f5f9 !important; border-color: #e2e8f0 !important; color: #334155; box-shadow: none !important; font-weight: 500; }
            .token-wrapper .button:hover { background-color: #e2e8f0 !important; border-color: #cbd5e1 !important; }
            .recipepress-card .submit-wrapper { margin-top: 1.5rem; text-align: left; }
            .recipepress-card .submit { padding: 0; margin: 0; }
            .recipepress-card .submit .button-primary { background-color: var(--rp-accent) !important; border-color: transparent !important; color: white; padding: 0.625rem 1.5rem !important; font-size: 0.875rem !important; height: auto !important; line-height: 1.25rem !important; border-radius: 0.375rem !important; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.1); transition: background-color 0.2s; }
            .recipepress-card .submit .button-primary:hover, .recipepress-card .submit .button-primary:focus { background-color: var(--rp-accent-hover) !important; border-color: transparent !important; box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important; }
            .wrap.recipepress-dashboard > h1 { display: none; }
        ";
        wp_add_inline_style('recipepress-admin-styles', $css);

        wp_enqueue_script('jquery');
        wp_add_inline_script('jquery', '
            jQuery(document).ready(function($) {
                $("#rpai-copy-token").on("click", function() {
                    var tokenInput = $("#rpai_site_token");
                    tokenInput.select();
                    document.execCommand("copy");
                    $(this).text("Copied!");
                    setTimeout(() => $(this).text("Copy"), 2000);
                });

                $("#rpai-generate-token").on("click", function() {
                    var $btn = $(this);
                    $btn.prop("disabled", true).text("Generating...");
                    $.post(ajaxurl, {
                        action: "rpai_generate_token",
                        _wpnonce: "' . wp_create_nonce('rpai_generate_token_nonce') . '"
                    }, function(response) {
                        if (response.success) {
                            $("#rpai_site_token").val(response.data.token);
                            $btn.prop("disabled", false).text("Generate New");
                        } else {
                            alert("Error: " . response.data.message);
                            $btn.prop("disabled", false).text("Generate New");
                        }
                    });
                });
            });
        ');
    }

    public function ajax_generate_token() {
        check_ajax_referer('rpai_generate_token_nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Permission denied.']);
        }
        $new_token = wp_generate_password(40, false);
        update_option('recipepress_ai_site_token', $new_token);
        wp_send_json_success(['token' => $new_token]);
    }

    public function admin_menu() {
        $icon_svg = 'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#8B5CF6"><path fill-rule="evenodd" d="M11.385,2.467c-2.484,1.438-5.07,3.633-7.248,6.505c-1.218,1.606-2.023,3.36-2.43,5.163c-0.28,1.238,0.015,2.5,0.75,3.56c0.719,1.04,1.884,1.666,3.153,1.794c0.501,0.051,1,0.01,1.492-0.124c1.536-0.42,2.949-1.282,4.181-2.467c1.658-1.597,2.835-3.61,3.473-5.895c0.449-1.6,0.339-3.27-0.31-4.815c-0.286-0.684-0.66-1.304-1.109-1.838C12.351,5.29,11.838,3.905,11.385,2.467z M8.723,14.659c-0.78,0.28-1.602,0.203-2.342-0.213c-0.755-0.422-1.28-1.123-1.476-1.933c-0.256-1.063-0.012-2.179,0.658-3.125c0.556-0.799,1.236-1.499,1.999-2.181c0.08,0.177,0.163,0.352,0.25,0.525c0.4,0.806,0.999,1.536,1.751,2.138L8.723,14.659z M10.46,12.06c-0.583-1.029-0.767-2.208-0.51-3.321c0.122-0.536,0.362-1.04,0.695-1.492l0.227-0.306l0.277,0.145c0.495,0.26,0.945,0.591,1.329,0.999c1.559,1.655,2.289,3.844,1.956,5.981c-0.091,0.575-0.27,1.129-0.519,1.643L10.46,12.06z" clip-rule="evenodd"></path></svg>');
        add_menu_page('RecipePress Blog AI', 'RecipePress Blog AI', 'manage_options', $this->menu_slug, [ $this, 'settings_page' ], $icon_svg, 25);
    }

    public function settings_init() {
        if ( ! get_option('recipepress_ai_site_token') ) {
            update_option('recipepress_ai_site_token', wp_generate_password(40,false));
        }
        if ( false === get_option('recipepress_ai_insert_position') ) {
             update_option('recipepress_ai_insert_position', 'last');
        }
        register_setting( $this->option_group, 'recipepress_ai_site_token' );
        register_setting( $this->option_group, 'recipepress_ai_post_author' );
        register_setting( $this->option_group, 'recipepress_ai_insert_position' );
    }

    public function settings_page() {
        if ( ! current_user_can('manage_options') ) return;
        ?>
        <div class="wrap recipepress-dashboard">
            <div class="recipepress-main-header">
                <div class="recipepress-logo-wrapper">
                    <img src="<?php echo 'data:image/svg+xml;base64,' . base64_encode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#FFFFFF"><path fill-rule="evenodd" d="M11.385,2.467c-2.484,1.438-5.07,3.633-7.248,6.505c-1.218,1.606-2.023,3.36-2.43,5.163c-0.28,1.238,0.015,2.5,0.75,3.56c0.719,1.04,1.884,1.666,3.153,1.794c0.501,0.051,1,0.01,1.492-0.124c1.536-0.42,2.949-1.282,4.181-2.467c1.658-1.597,2.835-3.61,3.473-5.895c0.449-1.6,0.339-3.27-0.31-4.815c-0.286-0.684-0.66-1.304-1.109-1.838C12.351,5.29,11.838,3.905,11.385,2.467z M8.723,14.659c-0.78,0.28-1.602,0.203-2.342-0.213c-0.755-0.422-1.28-1.123-1.476-1.933c-0.256-1.063-0.012-2.179,0.658-3.125c0.556-0.799,1.236-1.499,1.999-2.181c0.08,0.177,0.163,0.352,0.25,0.525c0.4,0.806,0.999,1.536,1.751,2.138L8.723,14.659z M10.46,12.06c-0.583-1.029-0.767-2.208-0.51-3.321c0.122-0.536,0.362-1.04,0.695-1.492l0.227-0.306l0.277,0.145c0.495,0.26,0.945,0.591,1.329,0.999c1.559,1.655,2.289,3.844,1.956,5.981c-0.091,0.575-0.27,1.129-0.519,1.643L10.46,12.06z" clip-rule="evenodd"></path></svg>'); ?>" alt="RecipePress Blog AI Logo" class="recipepress-logo" />
                </div>
                <div>
                    <h1>RecipePress Blog AI Dashboard</h1>
                    <p>Manage your connection and settings.</p>
                </div>
            </div>
            
            <form method="post" action="options.php">
                <?php settings_fields( $this->option_group ); ?>
                <div class="recipepress-grid">
                    <div class="recipepress-card">
                        <div class="card-header">
                            <h2>Connection Settings</h2>
                            <p class="card-description">Configure how the app connects to this site.</p>
                        </div>
                        <div class="card-content">
                            <div>
                                <div class="form-group">
                                    <label for="rpai_site_token">Site Token</label>
                                    <div class="token-wrapper">
                                        <input type="text" readonly id="rpai_site_token" name="recipepress_ai_site_token" class="token-input" value="<?php echo esc_attr( get_option('recipepress_ai_site_token') ); ?>" />
                                        <button type="button" class="button" id="rpai-copy-token">Copy</button>
                                        <button type="button" class="button" id="rpai-generate-token">Generate New</button>
                                    </div>
                                    <p class="description">Copy this token into your RecipePress AI app to connect this site.</p>
                                </div>
                            </div>
                            <div class="submit-wrapper">
                                <?php submit_button('Save Changes'); ?>
                            </div>
                        </div>
                    </div>
                     <div class="recipepress-card">
                        <div class="card-header">
                            <h2>Content Settings</h2>
                            <p class="card-description">Control how recipes are created and placed.</p>
                        </div>
                        <div class="card-content">
                            <div>
                                <div class="form-group">
                                    <label for="rpai_post_author">Default Post Author</label>
                                    <div class="recipepress-select-wrapper">
                                        <?php wp_dropdown_users(['name'=>'recipepress_ai_post_author', 'id' => 'rpai_post_author', 'class' => 'recipepress-select', 'selected'=>get_option('recipepress_ai_post_author'),'role__in'=>['Administrator','Editor'],'show_option_none'=>'— Select Author —']); ?>
                                    </div>
                                    <p class="description">This author will be assigned to all recipes created by the AI.</p>
                                </div>
                                <div class="form-group">
                                    <label for="rpai_insert_position">Recipe Placement</label>
                                    <div class="recipepress-select-wrapper">
                                        <?php $pos = get_option('recipepress_ai_insert_position', 'last'); ?>
                                        <select name="recipepress_ai_insert_position" id="rpai_insert_position" class="recipepress-select">
                                            <option value="top" <?php selected($pos, 'top'); ?>>Top of Post</option>
                                            <option value="middle" <?php selected($pos, 'middle'); ?>>Middle of Post</option>
                                            <option value="last" <?php selected($pos, 'last'); ?>>Bottom of Post</option>
                                        </select>
                                    </div>
                                    <p class="description">Choose where to insert the recipe card within the post content.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <?php
    }

    private function authenticate_post_request( WP_REST_Request $request ) {
        $data = $request->get_json_params();
        $sent_token = isset( $data['site_token'] ) ? $data['site_token'] : '';
        $secret_key = get_option( 'recipepress_ai_site_token' );
        if ( empty( $secret_key ) || empty( $sent_token ) || ! hash_equals( $secret_key, $sent_token ) ) {
            return new WP_Error( 'invalid_token', 'Site Token is incorrect.', [ 'status' => 403 ] );
        }
        $author_id = get_option( 'recipepress_ai_post_author' );
        if ( empty( $author_id ) ) {
            return new WP_Error( 'author_not_set', 'A Default Post Author is not set in the plugin settings.', [ 'status' => 400 ] );
        }
        return [ 'data' => $data, 'author_id' => $author_id ];
    }

    private function authenticate_get_request( WP_REST_Request $request ) {
        $sent_token = $request->get_header('Authorization');
        if ($sent_token && preg_match('/Bearer\\s+(.*)/i', $sent_token, $matches)) {
            $sent_token = $matches[1];
        }
        $secret_key = get_option( 'recipepress_ai_site_token' );
        if ( empty( $secret_key ) || empty( $sent_token ) || ! hash_equals( $secret_key, $sent_token ) ) {
            return new WP_Error( 'invalid_token', 'Site Token is incorrect.', [ 'status' => 403 ] );
        }
        return true;
    }

    private function has_recipe_card($post_content) {
        $recipe_block_names = [
            'wp-tasty/tasty-recipe',
            'wp-recipe-maker/recipe',
            'create/recipe',
            'zip-recipes/recipe-card',
            'delicious-recipes/recipe-card-dynamic',
            'recipe-card-blocks-by-wpzoom/recipe-card',
            'whisk/recipe-card',
            'food-blog-blocks/recipe-card',
        ];
        foreach ($recipe_block_names as $block_name) {
            if (has_block($block_name, $post_content)) {
                return true;
            }
        }
        $recipe_shortcodes = [
            'wprm-recipe', 'tasty-recipe', 'amd-zlrecipe-recipe', 'ultimate-recipe',
            'yumprint-recipe', 'cooked-recipe', 'easyrecipe', 'recipe-card', 'zrdn-recipe-auto',
        ];
        foreach ($recipe_shortcodes as $shortcode) {
            if (has_shortcode($post_content, $shortcode)) {
                return true;
            }
        }
        return false;
    }

    private function get_recipe_details_from_post_content($post_content, $post_id = 0) {
        $details = [
            'has_card' => false,
            'has_ingredients' => false,
            'has_instructions' => false,
            'recipe_id' => null,
        ];
        if (!$this->has_recipe_card($post_content)) {
            return $details;
        }
        $details['has_card'] = true;
        $parsed_blocks = parse_blocks($post_content);
        foreach ($parsed_blocks as $block) {
            if ( empty($block['blockName']) ) continue;
            if ($block['blockName'] === 'wp-tasty/tasty-recipe' && isset($block['attrs']['id'])) {
                $recipe_id = intval($block['attrs']['id']);
                $details['recipe_id'] = $recipe_id;
                if ($recipe_id > 0) {
                    $tasty_data = get_post_meta($recipe_id, '_tasty_recipes_data', true);
                    if (is_array($tasty_data)) {
                        $ingredients = $tasty_data['recipeIngredient'] ?? [];
                        if (is_array($ingredients)) {
                            foreach ($ingredients as $item) {
                                if (!empty(trim($item['raw'] ?? ''))) {
                                    $details['has_ingredients'] = true;
                                    break;
                                }
                            }
                        }
                        $instructions = $tasty_data['recipeInstructions'] ?? [];
                        if (is_array($instructions)) {
                            foreach ($instructions as $item) {
                                if (!empty(trim($item['text'] ?? ''))) {
                                    $details['has_instructions'] = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                break;
            }
        }
        if ($details['has_card'] && !$details['has_ingredients'] && !$details['has_instructions']) {
            $details['has_ingredients'] = true;
            $details['has_instructions'] = true;
        }
        return $details;
    }

    private function get_existing_recipe_id_from_post($post_id) {
        $post = get_post($post_id);
        if (!$post) return 0;
        if (has_block('wp-tasty/tasty-recipe', $post->post_content)) {
            $parsed_blocks = parse_blocks($post->post_content);
            foreach ($parsed_blocks as $block) {
                if ($block['blockName'] === 'wp-tasty/tasty-recipe' && isset($block['attrs']['id'])) {
                    return intval($block['attrs']['id']);
                }
            }
        }
        return 0;
    }

    private function save_recipe_data( $recipe_data, $author_id, $parent_post_id, $existing_recipe_id = 0 ) {
        $normalize = function($val){
            if ( is_array($val) ) return array_values(array_filter(array_map('trim',$val)));
            if ( is_string($val) ) {
                $s = trim($val);
                $s = preg_replace('/[\\r\\n\\t]+/','\\n',$s);
                $s = str_replace(["\u2022","\x95"], '-', $s);
                $parts = preg_split('/\\n+|(?<=\\d\\.)\\s+|[-•\\*]\\s*/u', $s);
                return array_values(array_filter(array_map('trim', $parts)));
            }
            return [];
        };
        $ingredients = $normalize($recipe_data['ingredients'] ?? []);
        $instructions = $normalize($recipe_data['instructions'] ?? []);
        $name = sanitize_text_field($recipe_data['name'] ?? 'Recipe');
        try {
            $recipe_post = [
                'post_title' => wp_strip_all_tags($name),
                'post_status' => 'publish',
                'post_author' => $author_id,
            ];
            if ($existing_recipe_id > 0) {
                $recipe_post['ID'] = $existing_recipe_id;
                wp_update_post($recipe_post);
                $recipe_id = $existing_recipe_id;
            } else {
                $recipe_post_type = post_type_exists('tasty_recipe') ? 'tasty_recipe' : 'tasty_recipes';
                $recipe_post['post_type'] = $recipe_post_type;
                $recipe_id = wp_insert_post($recipe_post, true);
                if (is_wp_error($recipe_id)) return $recipe_id;
            }
            $tasty_data = [
                'name' => $name,
                'author' => sanitize_text_field($recipe_data['author'] ?? ''),
                'description' => sanitize_text_field($recipe_data['description'] ?? ''),
                'prepTime' => sanitize_text_field($recipe_data['prep_time'] ?? ''),
                'cookTime' => sanitize_text_field($recipe_data['cook_time'] ?? ''),
                'totalTime' => sanitize_text_field($recipe_data['total_time'] ?? ''),
                'recipeYield' => sanitize_text_field($recipe_data['yield'] ?? ''),
                'recipeCuisine' => sanitize_text_field($recipe_data['cuisine'] ?? ''),
                'recipeCategory' => sanitize_text_field($recipe_data['category'] ?? ''),
                'recipeMethod' => sanitize_text_field($recipe_data['method'] ?? ''),
                'recipeDiet' => sanitize_text_field($recipe_data['diet'] ?? ''),
                'keywords' => implode(', ', is_array($recipe_data['keywords']) ? $recipe_data['keywords'] : []),
                'recipeIngredient' => array_map(function($i){ return ['raw'=> (string)$i]; }, $ingredients),
                'recipeInstructions' => array_map(function($s){ return ['text'=> (string)$s]; }, $instructions),
                'notes' => [ ['text' => sanitize_text_field($recipe_data['notes'] ?? '')] ],
            ];
            if ( ! empty( $recipe_data['video_url'] ) && filter_var($recipe_data['video_url'], FILTER_VALIDATE_URL) ) {
                $tasty_data['video'] = [ 'url' => esc_url_raw($recipe_data['video_url']) ];
            }
            if ( ! empty( $recipe_data['nutrition'] ) && is_array( $recipe_data['nutrition'] ) ) {
                $sanitized_nutrition = [];
                $allowed_keys = ['servingSize', 'calories', 'sugarContent', 'sodiumContent', 'fatContent', 'saturatedFatContent', 'unsaturatedFatContent', 'transFatContent', 'carbohydrateContent', 'fiberContent', 'proteinContent', 'cholesterolContent'];
                foreach( $recipe_data['nutrition'] as $key => $value ) {
                    if ( in_array($key, $allowed_keys) && !empty($value) ) {
                        $sanitized_nutrition[$key] = sanitize_text_field($value);
                    }
                }
                if (!empty($sanitized_nutrition)) $tasty_data['nutrition'] = $sanitized_nutrition;
            }
            $thumb_id = 0;
            if ( ! empty($recipe_data['image']) ) {
                require_once( ABSPATH . 'wp-admin/includes/file.php' );
                require_once( ABSPATH . 'wp-admin/includes/media.php' );
                require_once( ABSPATH . 'wp-admin/includes/image.php' );
                $image_data = base64_decode($recipe_data['image']);
                if ($image_data !== false) {
                    $base_name = sanitize_title($name);
                    if (empty($base_name)) $base_name = 'recipe-' . uniqid();
                    $file_name = $base_name . '.jpg';
                    $upload = wp_upload_bits($file_name, null, $image_data);
                    if (empty($upload['error'])) {
                        $file_path = $upload['file'];
                        $file_type = wp_check_filetype($file_path, null);
                        $attachment_data = array(
                            'post_mime_type' => $file_type['type'],
                            'post_title'     => sanitize_text_field($recipe_data['image_title'] ?? $name),
                            'post_content'   => sanitize_text_field($recipe_data['image_description'] ?? $name),
                            'post_excerpt'   => sanitize_text_field($recipe_data['image_description'] ?? $name),
                            'post_status'    => 'inherit',
                        );
                        $attach_id = wp_insert_attachment($attachment_data, $file_path, $parent_post_id);
                        if (!is_wp_error($attach_id)) {
                            $thumb_id = $attach_id;
                            $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);
                            wp_update_attachment_metadata($attach_id, $attach_data);
                            update_post_meta($attach_id, '_wp_attachment_image_alt', sanitize_text_field($recipe_data['image_alt'] ?? $name));
                            set_post_thumbnail($parent_post_id, $thumb_id);
                        }
                    }
                }
            }
            if ( ! $thumb_id && has_post_thumbnail($parent_post_id) ) {
                $thumb_id = get_post_thumbnail_id($parent_post_id);
            }
            if ($thumb_id) {
                set_post_thumbnail($recipe_id, $thumb_id);
                $img_url = wp_get_attachment_url( $thumb_id );
                if ( $img_url ) $tasty_data['image'] = $img_url;
            }
            update_post_meta($recipe_id, '_tasty_recipes_data', $tasty_data);
            update_post_meta($recipe_id, 'ingredients', implode("\n", $ingredients));
            update_post_meta($recipe_id, 'instructions', implode("\n", $instructions));
            return $recipe_id;
        } catch (Throwable $e) {
            return new WP_Error('critical_error', 'Error saving recipe data: ' . $e->getMessage());
        }
    }

    public function verify_connection_callback( WP_REST_Request $request ) {
        $auth_result = $this->authenticate_post_request( $request );
        if ( is_wp_error( $auth_result ) ) return $auth_result;
        return new WP_REST_Response( [ 'success' => true, 'message' => 'Connection ok' ], 200 );
    }

    private function build_faq_block_from_schema($schema) {
        if ( empty($schema) || !is_array($schema) || empty($schema['mainEntity']) || !is_array($schema['mainEntity']) ) return '';
        $questions_for_block_attr = [];
        $faq_items_html = '';
        foreach ( $schema['mainEntity'] as $index => $item ) {
            if ( !empty($item['name']) && !empty($item['acceptedAnswer']['text']) ) {
                $faq_items_html .= sprintf('<div class="rank-math-faq-item"><h3 class="rank-math-question">%s</h3><div class="rank-math-answer"><p>%s</p></div></div>', esc_html($item['name']), wp_kses_post($item['acceptedAnswer']['text']));
                $questions_for_block_attr[] = ['id' => 'faq-' . uniqid(), 'visible' => true, 'title' => $item['name'], 'content' => $item['acceptedAnswer']['text']];
            }
        }
        if ( empty($faq_items_html) ) return '';
        return '<!-- wp:rank-math/faq-block ' . json_encode(['questions' => $questions_for_block_attr]) . ' --><div class="wp-block-rank-math-faq-block">' . $faq_items_html . '</div><!-- /wp:rank-math/faq-block -->';
    }

    public function rest_import_callback( WP_REST_Request $request ) {
        try {
            @ini_set( 'memory_limit', '512M' );
            @set_time_limit( 300 );
            $auth_result = $this->authenticate_post_request( $request );
            if ( is_wp_error( $auth_result ) ) return $auth_result;
            $body = $auth_result['data'];
            $author_id = $auth_result['author_id'];
            $target_post_id = absint($body['target_post'] ?? 0);
            $new_post_title = $body['post_title'] ?? '';
            $new_post_content = $body['post_content'] ?? '';
            $recipe_data = $body['recipe_data'] ?? null;
            $faq_schema = $body['faqSchema'] ?? null;
            $post_status = sanitize_key($body['post_status'] ?? 'publish');
            $generation_type = $body['generation_type'] ?? 'intro';
            if ( ! is_array($recipe_data) ) return new WP_Error('missing_recipe_data', 'Recipe data is missing or invalid.', ['status' => 400]);
            $is_new_post = false;
            if ( $target_post_id === 0 ) {
                if ( empty( $new_post_title ) ) return new WP_Error('missing_title', 'Post title cannot be empty when creating a new post.', ['status' => 400]);
                $is_new_post = true;
                $new_post_id = wp_insert_post(['post_type'=>'post','post_title'=>sanitize_text_field($new_post_title),'post_content'=>'<!-- placeholder -->','post_status'=>$post_status,'post_author'=>$author_id], true);
                if (is_wp_error($new_post_id)) return $new_post_id;
                $target_post_id = $new_post_id;
            }
            $existing_recipe_id = $this->get_existing_recipe_id_from_post($target_post_id);
            $recipe_id_or_error = $this->save_recipe_data($recipe_data, $author_id, $target_post_id, $existing_recipe_id);
            if (is_wp_error($recipe_id_or_error)) {
                if ($is_new_post) wp_trash_post($target_post_id);
                return $recipe_id_or_error;
            }
            $recipe_id = $recipe_id_or_error;
            $block_to_insert = '<!-- wp:wp-tasty/tasty-recipe {"id":' . intval($recipe_id) . ',"lastUpdated":' . round(microtime(true) * 1000) . '} /-->';
            $post_obj = get_post($target_post_id);
            $base_content = ($is_new_post || $generation_type === 'full') ? $new_post_content : $post_obj->post_content;
            $content_sans_blocks = preg_replace('/<!-- wp:wp-tasty\\/tasty-recipe.*?\\/-->/s', '', $base_content);
            $content_sans_blocks = preg_replace('/<!-- wp:rank-math\\/faq-block.*?\\/wp:rank-math\\/faq-block -->/s', '', $content_sans_blocks);
            $content_sans_blocks = preg_replace('/<h2.*?>FAQs<\\/h2>/i', '', $content_sans_blocks);
            $article_content = trim($content_sans_blocks);
            $faq_block = $this->build_faq_block_from_schema($faq_schema);
            $faq_section = !empty($faq_block) ? "\n\n<h2>FAQs</h2>\n\n" . $faq_block : '';
            $placement = get_option('recipepress_ai_insert_position', 'last');
            if ($placement === 'top') $final_post_content = $block_to_insert . "\n\n" . $article_content . $faq_section;
            elseif ($placement === 'middle') {
                $paragraphs = preg_split('/(\\r\\n|\\n){2,}/', $article_content);
                if (count($paragraphs) > 1) {
                    $insertion_point = floor(count($paragraphs) / 2);
                    if ($insertion_point === 0) $insertion_point = 1;
                    array_splice($paragraphs, $insertion_point, 0, $block_to_insert);
                    $final_post_content = implode("\n\n", $paragraphs) . $faq_section;
                } else $final_post_content = $article_content . "\n\n" . $block_to_insert . $faq_section;
            } else $final_post_content = $article_content . $faq_section . "\n\n" . $block_to_insert;
            wp_update_post(['ID'=>$target_post_id,'post_title'=>sanitize_text_field($new_post_title),'post_content'=>$final_post_content,'post_status'=>$post_status], true);
            if (!empty($body['focus_keyword'])) {
                update_post_meta($target_post_id, '_yoast_wpseo_focuskw', sanitize_text_field($body['focus_keyword']));
                update_post_meta($target_post_id, 'rank_math_focus_keyword', sanitize_text_field($body['focus_keyword']));
            }
            return new WP_REST_Response(['success'=>true,'message'=>$is_new_post?'Post published!':'Post updated!','post_url'=>get_permalink($target_post_id),'post_id'=>$target_post_id], 200);
        } catch ( Throwable $e ) {
            return new WP_Error('critical_error', 'Server error: ' . $e->getMessage(), ['status' => 500]);
        }
    }

    public function get_posts_callback( WP_REST_Request $request ) {
        try {
            if ( is_wp_error( $this->authenticate_get_request($request) ) ) return $this->authenticate_get_request($request);
            $page = max( 1, absint( $request->get_param( 'page' ) ) );
            $per_page = min(max(1, absint($request->get_param('per_page') ?? 50)), 250);
            $q = new WP_Query( ['posts_per_page'=>$per_page, 'paged'=>$page, 'post_status'=>['publish', 'draft'], 'post_type'=>'post', 'orderby'=>'ID', 'order'=>'DESC'] );
            $posts_data = [];
            foreach ( $q->get_posts() as $p ) {
                $details = $this->get_post_details($p);
                if ($details) $posts_data[] = $details;
            }
            return new WP_REST_Response( ['posts'=>$posts_data,'total_posts'=>(int)$q->found_posts,'total_pages'=>(int)$q->max_num_pages,'page'=>$page,'per_page'=>$per_page], 200 );
        } catch ( Throwable $e ) {
            return new WP_Error( 'internal_server_error', 'Internal server error', [ 'status' => 500 ] );
        }
    }

    private function get_post_details($p) {
        $post_id = is_array($p) ? $p['ID'] : $p->ID;
        $post_obj = get_post($post_id);
        if (!$post_obj) return null;
        $post_content = $post_obj->post_content;
        $detail = $this->get_recipe_details_from_post_content($post_content, $post_id);
        return [
            'id' => $post_id,
            'title' => $post_obj->post_title,
            'link' => get_permalink($post_id),
            'post_status' => $post_obj->post_status,
            'has_recipe' => $detail['has_card'],
            'recipe_details' => $detail,
            'featured_image_url' => get_the_post_thumbnail_url($post_id, 'thumbnail') ?: null,
            'word_count' => str_word_count(strip_tags($post_content)),
            'language' => get_locale(),
            'focus_keyword' => get_post_meta($post_id, '_yoast_wpseo_focuskw', true) ?: (get_post_meta($post_id, 'rank_math_focus_keyword', true) ?: null),
        ];
    }

    public function register_rest_routes() {
        register_rest_route( 'recipepress-ai/v1', '/(.*?)', ['methods'=>'OPTIONS','callback'=>function(){return new WP_REST_Response('OK',200);},'permission_callback'=>'__return_true'] );
        register_rest_route( 'recipepress-ai/v1', '/verify-connection', ['methods'=>'POST','callback'=>[$this,'verify_connection_callback'],'permission_callback'=>'__return_true']);
        register_rest_route( 'recipepress-ai/v1', '/import', ['methods'=>'POST','callback'=>[$this,'rest_import_callback'],'permission_callback'=>'__return_true']);
        register_rest_route( 'recipepress-ai/v1', '/posts', ['methods'=>'GET','callback'=>[$this,'get_posts_callback'],'permission_callback'=>'__return_true']);
        register_rest_route( 'recipepress-ai/v1', '/post/(?P<id>\\d+)', ['methods'=>'GET','callback'=>function($r){
            if(is_wp_error($this->authenticate_get_request($r))) return $this->authenticate_get_request($r);
            $p=get_post($r->get_param('id'));
            return $p ? new WP_REST_Response(['content'=>$p->post_content,'title'=>$p->post_title],200) : new WP_Error('not_found','Post not found',['status'=>404]);
        },'permission_callback'=>'__return_true']);
    }
}

// Hook setup
add_action('init', function() {
    $instance = RecipePress_AI_Connector_Remote::instance();
});

register_activation_hook(__FILE__, ['RecipePress_AI_Connector_Remote', 'activate']);
register_deactivation_hook(__FILE__, ['RecipePress_AI_Connector_Remote', 'deactivate']);
?>`;