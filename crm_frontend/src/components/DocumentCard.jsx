import React from 'react';
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/solid';

const DocumentCard = ({ 
  document, 
  onDownload,
  onView, 
  onGeneratePdf 
}) => {
  const statusInfo = {
    signed: { 
      color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', 
      icon: <CheckIcon className="h-4 w-4" /> 
    },
    certificate: { 
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200', 
      icon: <DocumentTextIcon className="h-4 w-4" /> 
    },
    expired: { 
      color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200', 
      icon: <XMarkIcon className="h-4 w-4" /> 
    },
    archived: { 
      color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200', 
      icon: <DocumentTextIcon className="h-4 w-4" /> 
    }
  };

  const isCertificate = typeof document.category === 'object'
    ? document.category.name?.toLowerCase() === 'certificate'
    : document.category_name?.toLowerCase() === 'certificate';

  const hasValidSignature = document.signatures?.some(sig => sig.is_signed);
  const computedStatus = hasValidSignature ? 'signed' : (document.status || 'draft');

  return (
    <div className={`border border-gray-200 dark:border-gray-700 p-4 rounded-lg transition-colors group ${
      computedStatus === 'signed' 
        ? 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50' 
        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
    } shadow-sm dark:shadow-none`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-blue-600 dark:text-blue-400 truncate">
              {document.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              statusInfo[computedStatus]?.color || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            } ml-2 flex items-center gap-1`}>
              {statusInfo[computedStatus]?.icon}
              {computedStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 overflow-hidden">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isCertificate 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
            }`}>
              {isCertificate ? 'Certificate' : 'Signed Document'}
            </span>
          </div>

          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              {new Date(document.created_at).toLocaleDateString()}
            </span>

            {document.issue_date && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs">
                Issued: {new Date(document.issue_date).toLocaleDateString()}
              </span>
            )}
            {document.expiry_date && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs">
                Expires: {new Date(document.expiry_date).toLocaleDateString()}
              </span>
            )}
          </div>

          {document.tags && typeof document.tags === 'string' && document.tags.split(',').map((tag, i) => (
            <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs inline-block mt-1 mr-1">
              {tag.trim()}
            </span>
          ))}

          {document.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
              {document.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 ml-4">
          {/* Download */}
          {onDownload && (
            <button 
              onClick={() => onDownload(document)} 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors" 
              title="Download"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
          )}

          {/* View */}
          {onView && (
            <button
              onClick={() => onView(document)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              title="View Document"
            >
              <DocumentTextIcon className="h-5 w-5" />
            </button>
          )}

          {/* Generate PDF */}
          {onGeneratePdf && (
            <button 
              onClick={() => onGeneratePdf(document.id)} 
              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors" 
              title="Generate PDF"
            >
              <DocumentTextIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Signatures */}
      {document.signatures?.length > 0 && (
        <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            Signatures ({document.signatures.length})
          </h4>
          <div className="space-y-2">
            {document.signatures.map(sig => (
              <div key={sig.id} className="flex justify-between text-sm items-center">
                <span className="font-medium flex items-center text-gray-800 dark:text-gray-200">
                  {sig.signer_name}
                  {sig.is_valid ? (
                    <CheckIcon className="h-4 w-4 text-green-500 dark:text-green-400 ml-1" />
                  ) : (
                    <XMarkIcon className="h-4 w-4 text-red-500 dark:text-red-400 ml-1" />
                  )}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {new Date(sig.signed_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;