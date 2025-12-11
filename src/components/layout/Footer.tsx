export default function Footer() {
  return (
    <footer className="bg-brand-black border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="h-8 w-32 bg-brand-purple/30 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-800/30 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-800/30 rounded"></div>
            </div>
          </div>
          
          {/* Links Columns */}
          {[1, 2, 3].map((col) => (
            <div key={col} className="space-y-4">
              <div className="h-6 w-24 bg-gray-800/50 rounded"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((link) => (
                  <div key={link} className="h-4 w-32 bg-gray-800/30 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="h-4 w-64 bg-gray-800/30 rounded"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((social) => (
                <div key={social} className="w-8 h-8 bg-gray-800/30 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
